/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

// eslint-disable-next-line import/first
import { VerboseAddressGroupPanel } from './VerboseAddressGroupPanel'

const getItemsForPlural = (plural?: string) => {
  switch (plural) {
    case 'hostbindings':
      return [
        {
          metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            host: { name: 'host-a', namespace: 'tenant-a' },
          },
        },
      ]
    case 'networkbindings':
      return [
        {
          metadata: { name: 'network-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            network: { name: 'net-a', namespace: 'tenant-a' },
          },
        },
      ]
    case 'servicebindings':
      return [
        {
          metadata: { name: 'service-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            service: { name: 'svc-a', namespace: 'tenant-a' },
          },
        },
      ]
    case 'hosts':
      return [
        {
          metadata: { name: 'host-a', namespace: 'tenant-a' },
          spec: { displayName: 'Host A', IPs: { IPv4: ['10.0.0.10'] } },
        },
      ]
    case 'networks':
      return [
        {
          metadata: { name: 'net-a', namespace: 'tenant-a' },
          spec: { displayName: 'Network A', CIDR: '10.0.0.0/24' },
        },
      ]
    case 'services':
      return [
        {
          metadata: { name: 'svc-a', namespace: 'tenant-a' },
          spec: {
            displayName: 'Service A',
            transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '443' }] }],
          },
        },
      ]
    default:
      return []
  }
}

describe('VerboseAddressGroupPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: { items: getItemsForPlural(params.plural) },
      error: undefined,
      isLoading: false,
    }))
  })

  it('renders address group details, related refs, and bound entities', () => {
    render(
      <VerboseAddressGroupPanel
        cluster="cluster-a"
        namespace="tenant-a"
        addressGroup={
          {
            metadata: {
              name: 'ag-a',
              namespace: 'tenant-a',
              labels: { env: 'prod' },
              annotations: { owner: 'netops' },
            },
            spec: {
              displayName: 'Address Group A',
              defaultAction: 'Allow',
              logs: true,
              trace: false,
              description: 'Production access group',
              comment: 'Managed by UI',
            },
            refs: [{ kind: 'HostBinding', namespace: 'tenant-a', name: 'host-binding-a' }],
          } as any
        }
        onClose={jest.fn()}
        onExpand={jest.fn()}
        onCollapse={jest.fn()}
      />,
    )

    expect(screen.getAllByText('ag-a').length).toBeGreaterThan(0)
    expect(screen.getByText('Address Group A')).toBeInTheDocument()
    expect(screen.getByText('Allow')).toBeInTheDocument()
    expect(screen.getByText('Production access group')).toBeInTheDocument()
    expect(screen.getByText('env: prod')).toBeInTheDocument()
    expect(screen.getByText('owner: netops')).toBeInTheDocument()
    expect(screen.getByText('Host A')).toBeInTheDocument()
    expect(screen.getByText('Network A')).toBeInTheDocument()
    expect(screen.getByText('Service A')).toBeInTheDocument()
    expect(screen.getByText('HostBinding / tenant-a / host-binding-a')).toBeInTheDocument()
  })
})
