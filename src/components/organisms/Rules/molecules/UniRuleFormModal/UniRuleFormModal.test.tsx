/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockAxiosGet = jest.fn()
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

jest.mock('axios', () => ({
  get: (...args: unknown[]) => mockAxiosGet(...args),
}))

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

const getItemsForEndpoint = (endpoint: string) => {
  if (endpoint.endsWith('/addressgroups')) {
    return getItemsForPlural('addressgroups')
  }

  if (endpoint.endsWith('/services')) {
    return getItemsForPlural('services')
  }

  return []
}

describe('UniRuleFormModal', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
    mockAxiosGet.mockImplementation(async (endpoint: string) => ({
      data: { items: getItemsForEndpoint(endpoint) },
    }))
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

  it('scopes local endpoint options to the rule namespace before form initialization', async () => {
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
                local: { type: 'AddressGroup', namespace: 'tenant-c', name: 'ag-a' },
                remote: { type: 'AddressGroup', namespace: 'tenant-b', name: 'ag-b' },
              },
            },
          } as any
        }
      />,
    )

    await screen.findByDisplayValue('rule-a')

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/addressgroups',
      )
    })
    expect(mockAxiosGet).not.toHaveBeenCalledWith(
      '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-c/addressgroups',
    )
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'tenant-b',
        plural: 'addressgroups',
        isEnabled: true,
      }),
    )
  })

  it('shows local namespace-scoped AddressGroups even when response items omit namespace', async () => {
    mockAxiosGet.mockImplementation(async (endpoint: string) => ({
      data: {
        items: endpoint.endsWith('/addressgroups')
          ? [{ metadata: { name: 'ag-a' }, spec: { displayName: 'Address Group A' } }]
          : getItemsForEndpoint(endpoint),
      },
    }))
    mockUseK8sSmartResource.mockImplementation((params: { namespace?: string; plural?: string }) => {
      return {
        data: { items: params.plural === 'addressgroups' ? [] : getItemsForPlural(params.plural) },
        error: undefined,
        isLoading: false,
      }
    })

    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        initialValues={{
          remote: { type: 'FQDN', value: 'api.example.com' },
          transportProtocol: 'TCP',
          transportEntries: [{ ports: '443' }],
        }}
        open
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => expect(screen.getByDisplayValue(/^rules-/)).toBeInTheDocument())

    let localSelector: HTMLElement | undefined

    await waitFor(() => {
      localSelector = document.getElementById('local_name') || undefined
      expect(localSelector).toBeInTheDocument()
    })

    fireEvent.mouseDown(localSelector as HTMLElement)

    expect(await screen.findByText('Address Group A')).toBeInTheDocument()
  })

  it('applies create-mode initial endpoint values before submit', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        initialValues={{
          local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
          remote: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
        }}
        open
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => expect(screen.getAllByDisplayValue('tenant-a')).toHaveLength(2))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockCreateNewEntry).toHaveBeenCalledTimes(1))
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            endpoints: {
              local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
              remote: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
            },
          }),
        }),
      }),
    )
  })

  it('submits AddressGroup to FQDN create rules as egress only', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        initialValues={{
          traffic: 'Both',
          local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
          remote: { type: 'FQDN', value: 'api.example.com' },
          transportProtocol: 'TCP',
          transportEntries: [{ ports: '443' }],
        }}
        open
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/^rules-/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockCreateNewEntry).toHaveBeenCalledTimes(1))
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            endpoints: {
              local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
              remote: { type: 'FQDN', value: 'api.example.com' },
            },
            session: { traffic: 'Egress' },
          }),
        }),
      }),
    )
  })

  it('submits Service to FQDN create rules as egress only', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        initialValues={{
          traffic: 'Ingress',
          local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
          remote: { type: 'FQDN', value: 'api.example.com' },
          transportProtocol: 'TCP',
          transportEntries: [{ ports: '443' }],
        }}
        open
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/^rules-/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockCreateNewEntry).toHaveBeenCalledTimes(1))
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            endpoints: {
              local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
              remote: { type: 'FQDN', value: 'api.example.com' },
            },
            session: { traffic: 'Egress' },
          }),
        }),
      }),
    )
  })

  it('submits AddressGroup to CIDR create rules without Both traffic', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        initialValues={{
          traffic: 'Both',
          local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
          remote: { type: 'CIDR', value: '10.0.0.0/24' },
          transportProtocol: 'TCP',
          transportIPv: 'IPv4',
          transportEntries: [{ ports: '443' }],
        }}
        open
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/^rules-/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockCreateNewEntry).toHaveBeenCalledTimes(1))
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            endpoints: {
              local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
              remote: { type: 'CIDR', value: '10.0.0.0/24' },
            },
            session: { traffic: 'Egress' },
          }),
        }),
      }),
    )
  })

  it('submits Service to CIDR create rules with ingress or egress traffic only', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        initialValues={{
          traffic: 'Ingress',
          local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
          remote: { type: 'CIDR', value: '10.0.0.0/24' },
          transportProtocol: 'TCP',
          transportIPv: 'IPv4',
          transportEntries: [{ ports: '443' }],
        }}
        open
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/^rules-/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockCreateNewEntry).toHaveBeenCalledTimes(1))
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          spec: expect.objectContaining({
            endpoints: {
              local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
              remote: { type: 'CIDR', value: '10.0.0.0/24' },
            },
            session: { traffic: 'Ingress' },
          }),
        }),
      }),
    )
  })

  it('shows the display name input from the title pencil only in edit mode', async () => {
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
              displayName: 'Rule A',
              action: 'Allow',
              endpoints: {
                local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
                remote: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
              },
            },
          } as any
        }
      />,
    )

    expect(await screen.findByText('Rule A')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('e.g. api-to-db')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit display name' }))

    expect(screen.getByPlaceholderText('e.g. api-to-db')).toBeInTheDocument()
  })

  it('adds the first transport entry when a protocol has been selected', async () => {
    renderModal(
      <UniRuleFormModal
        cluster="cluster-a"
        namespace="tenant-a"
        open
        initialValues={{ transportProtocol: 'TCP' }}
        onClose={jest.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/^rules-/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Ports' }))

    await waitFor(() => {
      expect(
        Array.from(document.body.querySelectorAll('.ant-collapse-item-active')).some(
          collapseItem => collapseItem.textContent?.includes('Port 1'),
        ),
      ).toBe(true)
    })
    expect(screen.queryByText('No transport entries')).not.toBeInTheDocument()
  })
})
