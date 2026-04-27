/* eslint-disable no-nested-ternary */
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
import { HostFormModal } from './HostFormModal'

const renderModal = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('HostFormModal', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockDeleteEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: {
        items:
          params.plural === 'tenants'
            ? [{ metadata: { name: 'tenant-a' } }]
            : params.plural === 'addressgroups'
            ? [{ metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Address Group A' } }]
            : [],
      },
      error: undefined,
      isLoading: false,
    }))
  })

  it('creates a host from the modal form', async () => {
    const onClose = jest.fn()

    renderModal(<HostFormModal cluster="cluster-a" namespace="tenant-a" open onClose={onClose} />)

    fireEvent.change(await screen.findByPlaceholderText('e.g. h-api-prod-01'), {
      target: { value: 'host-new' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. server-01.prod'), {
      target: { value: 'Host New' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockCreateNewEntry).toHaveBeenCalledWith({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts',
        body: expect.objectContaining({
          kind: 'Host',
          metadata: { name: 'host-new', namespace: 'tenant-a' },
          spec: { displayName: 'Host New' },
        }),
      })
    })
    expect(mockMessage.success).toHaveBeenCalledWith('Host created')
    expect(onClose).toHaveBeenCalled()
  })

  it('validates host display name length before submit', async () => {
    const onClose = jest.fn()

    renderModal(<HostFormModal cluster="cluster-a" namespace="tenant-a" open onClose={onClose} />)

    fireEvent.change(await screen.findByPlaceholderText('e.g. h-api-prod-01'), {
      target: { value: 'host-new' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. server-01.prod'), {
      target: { value: 'x'.repeat(64) },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Display name must be 63 characters or less')).toBeInTheDocument()
    expect(mockCreateNewEntry).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
