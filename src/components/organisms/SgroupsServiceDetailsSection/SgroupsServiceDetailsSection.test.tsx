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

jest.mock('components/organisms/Services/molecules/ServiceFormModal/utils', () => ({
  syncAddressGroupBindings: (...args: unknown[]) => mockSyncAddressGroupBindings(...args),
}))

import { SgroupsServiceDetailsSection } from './SgroupsServiceDetailsSection'

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SgroupsServiceDetailsSection data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />
    </QueryClientProvider>,
  )
}

const serviceResource = {
  metadata: {
    name: 'service-a',
    namespace: 'tenant-a',
    uid: 'uid-service',
    labels: { env: 'prod' },
    annotations: { note: 'keep' },
    creationTimestamp: '2026-05-17T16:45:00Z',
  },
  spec: {
    description: 'Service description',
    comment: 'Service comment',
    transports: [
      {
        IPv: 'IPv4',
        protocol: 'TCP',
        entries: [{ ports: '80,443' }],
      },
    ],
  },
}

const currentBinding = {
  metadata: { name: 'service-a-ag-a', namespace: 'tenant-a' },
  spec: {
    service: { name: 'service-a', namespace: 'tenant-a' },
    addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
  },
}

describe('SgroupsServiceDetailsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    mockSyncAddressGroupBindings.mockResolvedValue(1)
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'services') {
        return { data: { items: [serviceResource] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'servicebindings') {
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

  it('renders service assignment counts and saves AddressGroup bindings', async () => {
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
      { name: 'service-a', namespace: 'tenant-a' },
      expect.objectContaining({
        namespace: 'tenant-a',
        name: 'service-a',
        addressGroups: ['tenant-a/ag-a'],
      }),
      [currentBinding],
    )
  })

  it('patches service labels from the labels modal', async () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('button', { name: /1 labels/i }))

    expect(await screen.findByText('Edit Labels')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/services/service-a',
      pathToValue: '/metadata/labels',
      body: { env: 'prod' },
    })
  })

  it('patches service annotations from the annotations modal', async () => {
    renderWithQueryClient()

    fireEvent.click(screen.getByRole('button', { name: /1 annotations/i }))

    expect(await screen.findByText('Edit Annotations')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledTimes(1))
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/services/service-a',
      pathToValue: '/metadata/annotations',
      body: { note: 'keep' },
    })
  })
})
