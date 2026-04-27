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
import { VerboseRulePanel } from './VerboseRulePanel'

const getItemsForPlural = (plural?: string) => {
  switch (plural) {
    case 'addressgroups':
      return [{ metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Address Group A' } }]
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
    case 'hosts':
      return [
        {
          metadata: { name: 'host-a', namespace: 'tenant-a' },
          spec: { displayName: 'Host A', IPs: { IPv4: ['10.0.0.10'] } },
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
    case 'networkbindings':
    case 'servicebindings':
    case 'networks':
      return []
    default:
      return []
  }
}

describe('VerboseRulePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: { items: getItemsForPlural(params.plural) },
      error: undefined,
      isLoading: false,
    }))
  })

  it('renders rule details and endpoint trees', () => {
    render(
      <VerboseRulePanel
        cluster="cluster-a"
        namespace="tenant-a"
        rule={
          {
            metadata: {
              name: 'rule-a',
              namespace: 'tenant-a',
              labels: { env: 'prod' },
              annotations: { owner: 'security' },
            },
            spec: {
              displayName: 'Rule A',
              action: 'Allow',
              session: { traffic: 'ingress' },
              transport: {
                protocol: 'TCP',
                IPv: 'IPv4',
                entries: [{ ports: '443', description: 'https' }],
              },
              endpoints: {
                local: { type: 'AddressGroup', name: 'ag-a', namespace: 'tenant-a' },
                remote: { type: 'Service', name: 'svc-a', namespace: 'tenant-a' },
              },
              description: 'Allow API ingress',
              comment: 'Reviewed',
            },
          } as any
        }
        onClose={jest.fn()}
        onExpand={jest.fn()}
        onCollapse={jest.fn()}
      />,
    )

    expect(screen.getAllByText('rule-a').length).toBeGreaterThan(0)
    expect(screen.getByText('Rule A')).toBeInTheDocument()
    expect(screen.getByText('Allow')).toBeInTheDocument()
    expect(screen.getByText('Ingress')).toBeInTheDocument()
    expect(screen.getByText('TCP')).toBeInTheDocument()
    expect(screen.getByText('IPv4')).toBeInTheDocument()
    expect(screen.getByText(/Ports: 443/)).toBeInTheDocument()
    expect(screen.getByText('ag-a')).toBeInTheDocument()
    expect(screen.getByText('svc-a')).toBeInTheDocument()
    expect(screen.getByText('Address Group A')).toBeInTheDocument()
    expect(screen.getByText('Service A')).toBeInTheDocument()
  })
})
