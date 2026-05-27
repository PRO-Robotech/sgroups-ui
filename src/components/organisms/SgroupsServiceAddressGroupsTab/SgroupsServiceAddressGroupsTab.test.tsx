/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()
const mockServiceFormModal = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/Services/molecules', () => ({
  ServiceFormModal: (props: any) => {
    const { open, service } = props

    mockServiceFormModal(props)

    return open ? <div>Edit Service Modal {service?.metadata?.name}</div> : null
  },
}))

jest.mock('utils', () => ({
  buildNamespacedValue: (value?: { namespace?: string; name?: string }) =>
    value?.namespace && value?.name ? `${value.namespace}/${value.name}` : undefined,
  formatDateTime: (value?: string) => value || '-',
  renderLinkedResourceBadge: ({ displayValue }: { displayValue: string }) => <a href="/addressgroup">{displayValue}</a>,
  renderTimestampWithIcon: (value?: string) => value || '-',
}))

import { SgroupsServiceAddressGroupsTab } from './SgroupsServiceAddressGroupsTab'

const service = {
  metadata: { name: 'service-a', namespace: 'tenant-a', creationTimestamp: '2026-05-01T10:00:00Z' },
  spec: { displayName: 'API Service' },
}

const matchingBinding = {
  metadata: { name: 'service-a-ag-a', namespace: 'tenant-a', creationTimestamp: '2026-05-02T10:00:00Z' },
  spec: {
    displayName: 'Service A to Group A',
    service: { name: 'service-a', namespace: 'tenant-a' },
    addressGroup: { name: 'ag-a', namespace: 'tenant-b' },
  },
}

const otherBinding = {
  metadata: { name: 'service-b-ag-b', namespace: 'tenant-a', creationTimestamp: '2026-05-03T10:00:00Z' },
  spec: {
    displayName: 'Service B to Group B',
    service: { name: 'service-b', namespace: 'tenant-a' },
    addressGroup: { name: 'ag-b', namespace: 'tenant-a' },
  },
}

describe('SgroupsServiceAddressGroupsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'services') {
        return { data: { items: [service] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'servicebindings') {
        return { data: { items: [matchingBinding, otherBinding] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'addressgroups') {
        return {
          data: {
            items: [{ metadata: { name: 'ag-a', namespace: 'tenant-b' }, spec: { displayName: 'Group A' } }],
          },
          error: undefined,
          isLoading: false,
        }
      }

      return { data: undefined, error: undefined, isLoading: false }
    })
  })

  it('shows AddressGroups related to the current Service through ServiceBindings', () => {
    render(
      <SgroupsServiceAddressGroupsTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />,
    )

    expect(screen.getByText('Group A')).toBeInTheDocument()
    expect(screen.queryByText('Service A to Group A')).not.toBeInTheDocument()
    expect(screen.queryByText('Service B to Group B')).not.toBeInTheDocument()
  })

  it('opens the Service edit modal from the add button', () => {
    render(
      <SgroupsServiceAddressGroupsTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />,
    )

    fireEvent.click(within(screen.getByRole('button', { name: /add/i })).getByText('Add'))

    expect(screen.getByText('Edit Service Modal service-a')).toBeInTheDocument()
    expect(mockServiceFormModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        open: true,
        service,
      }),
    )
  })
})
