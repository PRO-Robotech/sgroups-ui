/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockPatchEntryWithReplaceOp = jest.fn()
const mockUseK8sSmartResource = jest.fn()
const mockSyncAddressGroupBindings = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    patchEntryWithReplaceOp: (...args: unknown[]) => mockPatchEntryWithReplaceOp(...args),
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/Hosts/molecules/HostFormModal/utils', () => ({
  syncAddressGroupBindings: (...args: unknown[]) => mockSyncAddressGroupBindings(...args),
}))

import { SgroupsHostDetailsSection } from './SgroupsHostDetailsSection'

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SgroupsHostDetailsSection data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'host-a' }} />
    </QueryClientProvider>,
  )
}

const hostResource = {
  metadata: {
    name: 'host-a',
    namespace: 'tenant-a',
    uid: 'uid-a',
    labels: { env: 'prod' },
    annotations: { note: 'keep' },
    creationTimestamp: '2026-05-17T16:45:00Z',
  },
  spec: {
    description: 'Host description',
    comment: 'Host comment',
    metaInfo: {
      hostName: 'node-a',
      os: 'Linux',
      platform: 'alpine',
      platformVersion: '3.22',
      kernelVersion: '5.15',
    },
    IPs: {
      IPv4: ['10.0.0.1'],
      IPv6: [],
    },
  },
}

const currentBinding = {
  metadata: { name: 'host-a-ag-a', namespace: 'tenant-a' },
  spec: {
    host: { name: 'host-a' },
    addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
  },
}

describe('SgroupsHostDetailsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    mockSyncAddressGroupBindings.mockResolvedValue(1)
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'hosts') {
        return { data: { items: [hostResource] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'hostbindings') {
        return { data: { items: [currentBinding] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'addressgroups') {
        return {
          data: {
            items: [
              { metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Group A' } },
              { metadata: { name: 'ag-b', namespace: 'tenant-a' }, spec: { displayName: 'Group B' } },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      return { data: undefined, error: undefined, isLoading: false }
    })
  })

  it('renders assignment counts and opens the AddressGroups modal with current bindings', async () => {
    renderWithQueryClient()

    expect(screen.getByRole('button', { name: /1 address groups/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1 labels/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1 annotations/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /1 address groups/i }))

    expect(await screen.findByText('Edit Address Groups')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockSyncAddressGroupBindings).toHaveBeenCalledTimes(1))
    expect(mockSyncAddressGroupBindings).toHaveBeenCalledWith(
      'cluster-a',
      { name: 'host-a', namespace: 'tenant-a' },
      expect.objectContaining({
        namespace: 'tenant-a',
        name: 'host-a',
        addressGroups: ['tenant-a/ag-a'],
      }),
      [currentBinding],
    )
  })

  it('patches labels from the labels modal', async () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('button', { name: /1 labels/i }))

    expect(await screen.findByText('Edit Labels')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a',
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
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a',
      pathToValue: '/metadata/annotations',
      body: { note: 'keep' },
    })
  })
})
