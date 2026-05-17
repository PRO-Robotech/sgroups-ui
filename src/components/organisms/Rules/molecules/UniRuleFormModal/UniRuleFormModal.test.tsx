/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockCreateNewEntry = jest.fn()
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
import { UniRuleFormModal } from './UniRuleFormModal'

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
    case 'addressgroups':
      return [{ metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Address Group A' } }]
    case 'services':
      return [{ metadata: { name: 'svc-a', namespace: 'tenant-a' } }]
    case 'hosts':
    case 'networks':
    case 'hostbindings':
    case 'networkbindings':
    case 'servicebindings':
      return []
    default:
      return []
  }
}

describe('UniRuleFormModal', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: { items: getItemsForPlural(params.plural) },
      error: undefined,
      isLoading: false,
    }))
  })

  it('submits an unchanged rule edit as a no-op', async () => {
    const onClose = jest.fn()

    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        open
        onClose={onClose}
        rule={
          {
            metadata: { namespace: 'tenant-a', name: 'rule-a' },
            spec: {
              action: 'Allow',
              session: { traffic: 'Both' },
              endpoints: {
                local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
                remote: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
              },
            },
          } as any
        }
      />,
    )

    expect((await screen.findByDisplayValue('rule-a')).closest('.ant-form-item-hidden')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockMessage.info).toHaveBeenCalledWith('No changes to save')
    })
    expect(mockCreateNewEntry).not.toHaveBeenCalled()
    expect(mockPatchEntryWithReplaceOp).not.toHaveBeenCalled()
    expect(mockPatchEntryWithDeleteOp).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('starts endpoint option queries from rule edit endpoints before form initialization', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        open
        onClose={jest.fn()}
        rule={
          {
            metadata: { namespace: 'tenant-a', name: 'rule-a' },
            spec: {
              action: 'Allow',
              endpoints: {
                local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
                remote: { type: 'AddressGroup', namespace: 'tenant-b', name: 'ag-b' },
              },
            },
          } as any
        }
      />,
    )

    await screen.findByDisplayValue('rule-a')

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'tenant-a',
        plural: 'addressgroups',
        isEnabled: true,
      }),
    )
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'tenant-b',
        plural: 'addressgroups',
        isEnabled: true,
      }),
    )
  })
})
