/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockPatchEntryWithReplaceOp = jest.fn()
const mockUseK8sSmartResource = jest.fn()
const mockAddressGroupFormModal = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    patchEntryWithReplaceOp: (...args: unknown[]) => mockPatchEntryWithReplaceOp(...args),
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/AddressGroups/molecules', () => ({
  AddressGroupFormModal: (props: any) => {
    const { open } = props

    mockAddressGroupFormModal(props)

    return open ? <div>Edit AddressGroup Assignments</div> : null
  },
}))

import { SgroupsAddressGroupDetailsSection } from './SgroupsAddressGroupDetailsSection'

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SgroupsAddressGroupDetailsSection data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-a' }} />
    </QueryClientProvider>,
  )
}

const addressGroupResource = {
  metadata: {
    name: 'ag-a',
    namespace: 'tenant-a',
    labels: { env: 'prod' },
    annotations: { note: 'keep' },
    creationTimestamp: '2026-05-17T16:45:00Z',
  },
  spec: {
    displayName: 'Production AG',
    defaultAction: 'Deny',
    logs: false,
    trace: true,
    description: 'Address group description',
    comment: 'Address group comment',
  },
}

describe('SgroupsAddressGroupDetailsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    addressGroupResource.spec.defaultAction = 'Deny'
    addressGroupResource.spec.logs = false
    addressGroupResource.spec.trace = true
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'addressgroups') {
        return { data: { items: [addressGroupResource] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'hostbindings') {
        return {
          data: {
            items: [
              {
                metadata: { name: 'hb-a', namespace: 'tenant-a' },
                spec: { host: { name: 'host-a' }, addressGroup: { name: 'ag-a' } },
              },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      if (params.plural === 'networkbindings') {
        return {
          data: {
            items: [
              {
                metadata: { name: 'nb-a', namespace: 'tenant-a' },
                spec: { network: { name: 'network-a' }, addressGroup: { name: 'ag-a', namespace: 'tenant-a' } },
              },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      if (params.plural === 'servicebindings') {
        return {
          data: {
            items: [
              {
                metadata: { name: 'sb-a', namespace: 'service-tenant' },
                spec: { service: { name: 'service-a' }, addressGroup: { name: 'ag-a', namespace: 'tenant-a' } },
              },
              {
                metadata: { name: 'sb-b', namespace: 'tenant-a' },
                spec: { service: { name: 'service-b' }, addressGroup: { name: 'ag-a' } },
              },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      if (params.plural === 'hosts') {
        return {
          data: {
            items: [
              {
                metadata: { name: 'host-a', namespace: 'tenant-a' },
                spec: { displayName: 'db-master-01', IPs: { IPv4: ['3.3.3.3/32'] } },
              },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      if (params.plural === 'networks') {
        return {
          data: {
            items: [{ metadata: { name: 'network-a', namespace: 'tenant-a' }, spec: { CIDR: '10.0.0.0/24' } }],
          },
          error: undefined,
          isLoading: false,
        }
      }

      if (params.plural === 'services') {
        return {
          data: {
            items: [{ metadata: { name: 'service-a', namespace: 'service-tenant' }, spec: { displayName: 'API' } }],
          },
          error: undefined,
          isLoading: false,
        }
      }

      return { data: undefined, error: undefined, isLoading: false }
    })
  })

  it('renders Figma-shaped AddressGroup detail cards without unsupported incoming ports', () => {
    renderWithQueryClient()

    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.getByText('Assignments')).toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Entities')).toBeInTheDocument()
    expect(screen.getByText('Namespace')).toBeInTheDocument()
    expect(screen.getByText('Default action')).toBeInTheDocument()
    expect(screen.getByText('Deny')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(screen.getByText('Trace')).toBeInTheDocument()
    expect(screen.getByText('Logs')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Disabled' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Enabled' })).toBeInTheDocument()
    expect(screen.getByText('Address group description')).toBeInTheDocument()
    expect(screen.getByText(/Hosts/)).toBeInTheDocument()
    expect(screen.getByText(/Networks/)).toBeInTheDocument()
    expect(screen.getByText(/Services/)).toBeInTheDocument()
    expect(screen.queryByText('db-master-01')).not.toBeInTheDocument()
    expect(screen.queryByText('3.3.3.3/32')).not.toBeInTheDocument()
    expect(screen.queryByText('Incoming ports')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /3 assignments/i })).toBeInTheDocument()
  })

  it('opens the AddressGroup edit modal from the assignments counter', () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('button', { name: /3 assignments/i }))

    expect(screen.getByText('Edit AddressGroup Assignments')).toBeInTheDocument()
    expect(mockAddressGroupFormModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        addressGroup: addressGroupResource,
        open: true,
      }),
    )
  })

  it('patches default action from the detail switch', async () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('switch'))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/addressgroups/ag-a',
      pathToValue: '/spec/defaultAction',
      body: 'Allow',
    })
  })

  it('patches default action to Deny when turning the detail switch off', async () => {
    addressGroupResource.spec.defaultAction = 'Allow'
    renderWithQueryClient()

    expect(screen.getByRole('switch')).toBeChecked()

    fireEvent.click(screen.getByRole('switch'))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/addressgroups/ag-a',
      pathToValue: '/spec/defaultAction',
      body: 'Deny',
    })
  })

  it('patches labels from the labels modal', async () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('button', { name: /1 labels/i }))

    expect(await screen.findByText('Edit Labels')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/addressgroups/ag-a',
      pathToValue: '/metadata/labels',
      body: { env: 'prod' },
    })
  })

  it('patches annotations from the annotations modal', async () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('button', { name: /1 annotations/i }))

    expect(await screen.findByText('Edit Annotations')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/addressgroups/ag-a',
      pathToValue: '/metadata/annotations',
      body: { note: 'keep' },
    })
  })
})
