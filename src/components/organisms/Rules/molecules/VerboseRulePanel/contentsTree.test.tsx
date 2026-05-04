/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { buildRuleEndpointTree } from './contentsTree'

const getTooltipTitle = (title: unknown) => {
  expect(React.isValidElement(title)).toBe(true)

  return (title as React.ReactElement<{ title?: React.ReactNode }>).props.title
}

describe('buildRuleEndpointTree', () => {
  it('returns a single empty leaf when no endpoint is configured', () => {
    expect(buildRuleEndpointTree({})).toEqual([
      { title: 'No endpoint configured', key: 'endpoint-empty', isLeaf: true },
    ])
  })

  it('returns literal endpoint leaves for FQDN and CIDR endpoints', () => {
    expect(buildRuleEndpointTree({ endpoint: { type: 'FQDN', value: 'api.example.com' } as any })).toEqual([
      { title: 'api.example.com', key: 'endpoint-FQDN', isLeaf: true },
    ])
    expect(buildRuleEndpointTree({ endpoint: { type: 'CIDR', value: '10.0.0.0/24' } as any })).toEqual([
      { title: '10.0.0.0/24', key: 'endpoint-CIDR', isLeaf: true },
    ])
  })

  it('expands a service endpoint into transport children', () => {
    const tree = buildRuleEndpointTree({
      endpoint: { type: 'Service', name: 'svc-a', namespace: 'tenant-a' } as any,
      services: [
        {
          metadata: { name: 'svc-a', namespace: 'tenant-a' },
          spec: {
            displayName: 'Service A',
            transports: [{ protocol: 'UDP', IPv: 'IPv6', entries: [{ ports: '53' }, { types: [8, 0] }] }],
          },
        },
      ] as any,
    })

    expect(tree).toEqual([
      expect.objectContaining({
        key: 'service-endpoint',
        children: [
          expect.objectContaining({
            title: 'UDP / IPv6',
            key: 'service-endpoint-transport-0',
            children: [
              { title: 'Ports: 53', key: 'service-endpoint-transport-0-entry-0', isLeaf: true },
              { title: 'Types: 8, 0', key: 'service-endpoint-transport-0-entry-1', isLeaf: true },
            ],
          }),
        ],
      }),
    ])
  })

  it('marks a missing service endpoint with not found or fetch error', () => {
    expect(
      buildRuleEndpointTree({
        endpoint: { type: 'Service', name: 'svc-a', namespace: 'tenant-a' } as any,
      }),
    ).toEqual([
      expect.objectContaining({
        key: 'service-endpoint',
        children: [{ title: 'Not found', key: 'service-endpoint-status', isLeaf: true }],
      }),
    ])

    expect(
      buildRuleEndpointTree({
        endpoint: { type: 'Service', name: 'svc-a', namespace: 'tenant-a' } as any,
        servicesError: true,
      }),
    ).toEqual([
      expect.objectContaining({
        children: [{ title: 'Error while fetching', key: 'service-endpoint-status', isLeaf: true }],
      }),
    ])
  })

  it('keeps service endpoint transport entry description and comment in the tooltip', () => {
    const tree = buildRuleEndpointTree({
      endpoint: { type: 'Service', name: 'svc-a', namespace: 'tenant-a' } as any,
      services: [
        {
          metadata: { name: 'svc-a', namespace: 'tenant-a' },
          spec: {
            transports: [
              {
                protocol: 'UDP',
                IPv: 'IPv4',
                entries: [{ ports: '50004-50006', description: 'range 50004-50006', comment: 'service note' }],
              },
            ],
          },
        },
      ] as any,
    })

    const title = tree[0].children?.[0].children?.[0].title

    render(<>{title}</>)

    expect(screen.getByText('Ports: 50004-50006')).toBeInTheDocument()
    expect(screen.queryByText(/Description:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Comment:/)).not.toBeInTheDocument()

    render(<>{getTooltipTitle(title)}</>)

    expect(screen.getByText(/range 50004-50006/)).toBeInTheDocument()
    expect(screen.getByText(/service note/)).toBeInTheDocument()
  })

  it('expands an address group endpoint into binding branches', () => {
    const tree = buildRuleEndpointTree({
      endpoint: { type: 'AddressGroup', name: 'ag-a', namespace: 'tenant-a' } as any,
      addressGroups: [
        { metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Address Group A' } },
      ] as any,
      hostBindings: [
        {
          metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            host: { name: 'host-a', namespace: 'tenant-a' },
          },
        },
      ] as any,
      networkBindings: [
        {
          metadata: { name: 'network-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            network: { name: 'net-a', namespace: 'tenant-a' },
          },
        },
      ] as any,
      serviceBindings: [
        {
          metadata: { name: 'service-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            service: { name: 'svc-a', namespace: 'tenant-a' },
          },
        },
      ] as any,
      hosts: [
        {
          metadata: { name: 'host-a', namespace: 'tenant-a' },
          spec: { displayName: 'Host A', IPs: { IPv4: ['10.0.0.10'] } },
        },
      ] as any,
      networks: [
        {
          metadata: { name: 'net-a', namespace: 'tenant-a' },
          spec: { displayName: 'Network A', CIDR: '10.0.0.0/24' },
        },
      ] as any,
      services: [
        {
          metadata: { name: 'svc-a', namespace: 'tenant-a' },
          spec: {
            displayName: 'Service A',
            transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '443' }] }],
          },
        },
      ] as any,
    })

    const addressGroupNode = tree[0]
    const branches = addressGroupNode.children || []

    expect(addressGroupNode).toEqual(expect.objectContaining({ key: 'address-group-endpoint' }))
    expect(branches.map(branch => branch.key)).toEqual([
      'address-group-endpoint-rule-hosts-root',
      'address-group-endpoint-rule-networks-root',
      'address-group-endpoint-rule-services-root',
    ])
    expect(branches[0].children?.[0]).toEqual(
      expect.objectContaining({
        title: 'host-binding-a',
        key: 'address-group-endpoint-rule-hosts-root-host-binding-tenant-a-host-binding-a',
        children: [
          expect.objectContaining({
            children: [
              {
                title: '10.0.0.10',
                key: 'address-group-endpoint-rule-hosts-root-host-binding-tenant-a-host-binding-a-resource-ip-10.0.0.10',
                isLeaf: true,
              },
            ],
          }),
        ],
      }),
    )
    expect(branches[1].children?.[0]).toEqual(
      expect.objectContaining({
        title: 'network-binding-a',
        key: 'address-group-endpoint-rule-networks-root-network-binding-tenant-a-network-binding-a',
        children: [
          expect.objectContaining({
            children: [
              {
                title: '10.0.0.0/24',
                key: 'address-group-endpoint-rule-networks-root-network-binding-tenant-a-network-binding-a-resource-cidr',
                isLeaf: true,
              },
            ],
          }),
        ],
      }),
    )
    expect(branches[2].children?.[0]).toEqual(
      expect.objectContaining({
        title: 'service-binding-a',
        key: 'address-group-endpoint-rule-services-root-service-binding-tenant-a-service-binding-a',
        children: [
          expect.objectContaining({
            children: [
              expect.objectContaining({
                title: 'TCP / IPv4',
                key: 'address-group-endpoint-rule-services-root-service-binding-tenant-a-service-binding-a-resource-transport-0',
                children: [
                  {
                    title: 'Ports: 443',
                    key: 'address-group-endpoint-rule-services-root-service-binding-tenant-a-service-binding-a-resource-transport-0-entry-0',
                    isLeaf: true,
                  },
                ],
              }),
            ],
          }),
        ],
      }),
    )
  })

  it('marks a missing address group endpoint with not found or fetch error', () => {
    expect(
      buildRuleEndpointTree({
        endpoint: { type: 'AddressGroup', name: 'ag-a', namespace: 'tenant-a' } as any,
      }),
    ).toEqual([
      expect.objectContaining({
        key: 'address-group-endpoint',
        children: [{ title: 'Not found', key: 'address-group-endpoint-status', isLeaf: true }],
      }),
    ])

    expect(
      buildRuleEndpointTree({
        endpoint: { type: 'AddressGroup', name: 'ag-a', namespace: 'tenant-a' } as any,
        addressGroupsError: true,
      }),
    ).toEqual([
      expect.objectContaining({
        children: [{ title: 'Error while fetching', key: 'address-group-endpoint-status', isLeaf: true }],
      }),
    ])
  })
})
