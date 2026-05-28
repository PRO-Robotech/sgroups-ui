/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()
const mockAddressGroupFormModal = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/AddressGroups/molecules', () => ({
  AddressGroupFormModal: (props: any) => {
    const { addressGroup, open } = props

    mockAddressGroupFormModal(props)

    return open ? <div>Edit AddressGroup Modal {addressGroup?.metadata?.name}</div> : null
  },
}))

jest.mock('utils', () => ({
  buildNamespacedValue: (value?: { namespace?: string; name?: string }) =>
    value?.namespace && value?.name ? `${value.namespace}/${value.name}` : undefined,
  formatDateTime: (value?: string) => value || '-',
  renderLinkedResourceBadge: ({ displayValue }: { displayValue: string }) => <a href="/resource">{displayValue}</a>,
  renderTimestampWithIcon: (value?: string) => value || '-',
}))

import { SgroupsAddressGroupEntitiesTab } from './SgroupsAddressGroupEntitiesTab'

const addressGroup = {
  metadata: { name: 'ag-a', namespace: 'tenant-a' },
  spec: { displayName: 'Group A' },
}

describe('SgroupsAddressGroupEntitiesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'addressgroups') {
        return { data: { items: [addressGroup] }, error: undefined, isLoading: false }
      }

      if (params.plural === 'networkbindings') {
        return {
          data: {
            items: [
              {
                metadata: { name: 'nb-a', namespace: 'tenant-a', creationTimestamp: '2026-05-02T10:00:00Z' },
                spec: { addressGroup: { name: 'ag-a' }, network: { name: 'network-a' } },
              },
              {
                metadata: { name: 'nb-other', namespace: 'tenant-a', creationTimestamp: '2026-05-03T10:00:00Z' },
                spec: { addressGroup: { name: 'ag-other' }, network: { name: 'network-other' } },
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
            items: [
              {
                metadata: { name: 'network-a', namespace: 'tenant-a' },
                spec: { displayName: 'Production Network', CIDR: '10.0.0.0/24' },
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
                metadata: { name: 'sb-a', namespace: 'service-tenant', creationTimestamp: '2026-05-04T10:00:00Z' },
                spec: {
                  addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
                  service: { name: 'service-a', namespace: 'service-tenant' },
                },
              },
              {
                metadata: { name: 'sb-no-ag-namespace', namespace: 'tenant-a' },
                spec: { addressGroup: { name: 'ag-a' }, service: { name: 'service-b' } },
              },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      if (params.plural === 'services') {
        return {
          data: {
            items: [
              {
                metadata: { name: 'service-a', namespace: 'service-tenant' },
                spec: {
                  displayName: 'API Service',
                  transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '443' }] }],
                },
              },
            ],
          },
          error: undefined,
          isLoading: false,
        }
      }

      return { data: { items: [] }, error: undefined, isLoading: false }
    })
  })

  it('shows Networks connected to the current AddressGroup through NetworkBindings', () => {
    render(
      <SgroupsAddressGroupEntitiesTab
        data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-a', kind: 'networks' }}
      />,
    )

    expect(screen.getByText('Networks')).toBeInTheDocument()
    expect(screen.getByText('Production Network')).toBeInTheDocument()
    expect(screen.getByText('10.0.0.0/24')).toBeInTheDocument()
    expect(screen.queryByText('nb-a')).not.toBeInTheDocument()
    expect(screen.queryByText('nb-other')).not.toBeInTheDocument()
  })

  it('does not match ServiceBindings that omit AddressGroup namespace', () => {
    render(
      <SgroupsAddressGroupEntitiesTab
        data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-a', kind: 'services' }}
      />,
    )

    expect(screen.getByText('API Service')).toBeInTheDocument()
    expect(screen.getByText('TCP / IPv4 / 443')).toBeInTheDocument()
    expect(screen.queryByText('sb-a')).not.toBeInTheDocument()
    expect(screen.queryByText('sb-no-ag-namespace')).not.toBeInTheDocument()
  })

  it('opens the AddressGroup edit modal from Add', () => {
    render(
      <SgroupsAddressGroupEntitiesTab
        data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-a', kind: 'networks' }}
      />,
    )

    fireEvent.click(within(screen.getByRole('button', { name: /add/i })).getByText('Add'))

    expect(screen.getByText('Edit AddressGroup Modal ag-a')).toBeInTheDocument()
    expect(mockAddressGroupFormModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        addressGroup,
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        open: true,
      }),
    )
  })
})
