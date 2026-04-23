import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockCreateNewEntry = jest.fn()
const mockDeleteEntry = jest.fn()
const mockPatchEntryWithDeleteOp = jest.fn()
const mockPatchEntryWithReplaceOp = jest.fn()
const mockUseK8sSmartResource = jest.fn()
const mockMessage = {
  error: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
}

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    createNewEntry: (...args: unknown[]) => mockCreateNewEntry(...args),
    deleteEntry: (...args: unknown[]) => mockDeleteEntry(...args),
    patchEntryWithDeleteOp: (...args: unknown[]) => mockPatchEntryWithDeleteOp(...args),
    patchEntryWithReplaceOp: (...args: unknown[]) => mockPatchEntryWithReplaceOp(...args),
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('antd', () => {
  const actual = jest.requireActual('antd')

  return {
    ...actual,
    message: mockMessage,
  }
})

// eslint-disable-next-line import/first
import { AddressGroupFormModal } from './AddressGroupFormModal'

const renderModal = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const getItemsForPlural = (plural?: string) => {
  switch (plural) {
    case 'tenants':
      return [{ metadata: { name: 'tenant-a' } }]
    case 'hosts':
      return [{ metadata: { name: 'host-a', namespace: 'tenant-a' } }]
    case 'networks':
      return [{ metadata: { name: 'net-a', namespace: 'tenant-a' } }]
    case 'services':
      return [{ metadata: { name: 'svc-a', namespace: 'tenant-a' } }]
    case 'hostbindings':
    case 'networkbindings':
    case 'servicebindings':
      return []
    default:
      return []
  }
}

describe('AddressGroupFormModal', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockDeleteEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: { items: getItemsForPlural(params.plural) },
      error: undefined,
      isLoading: false,
    }))
  })

  it('creates an address group from the modal form', async () => {
    const onClose = jest.fn()

    renderModal(<AddressGroupFormModal cluster="cluster-a" namespace="tenant-a" open onClose={onClose} />)

    fireEvent.change(await screen.findByPlaceholderText('e.g. server-01-prod'), {
      target: { value: 'ag-new' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. server-01.prod'), {
      target: { value: 'Address Group New' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockCreateNewEntry).toHaveBeenCalledWith({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/addressgroups',
        body: expect.objectContaining({
          kind: 'AddressGroup',
          metadata: { name: 'ag-new', namespace: 'tenant-a' },
          spec: expect.objectContaining({
            displayName: 'Address Group New',
            defaultAction: 'Deny',
          }),
        }),
      })
    })
    expect(mockMessage.success).toHaveBeenCalledWith('Address group created')
    expect(onClose).toHaveBeenCalled()
  })
})
