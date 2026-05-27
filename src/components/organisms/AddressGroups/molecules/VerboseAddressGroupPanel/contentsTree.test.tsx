/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { buildAddressGroupContentsTree } from './contentsTree'

const getTooltipTitle = (title: unknown) => {
  expect(React.isValidElement(title)).toBe(true)

  return (title as React.ReactElement<{ title?: React.ReactNode }>).props.title
}

describe('buildAddressGroupContentsTree', () => {
  it('builds host, network, and service branches for bindings that match the address group', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      hostBindings: [
        {
          metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            host: { name: 'host-a', namespace: 'tenant-a' },
          },
        },
        {
          metadata: { name: 'host-binding-other', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-b', namespace: 'tenant-a' },
            host: { name: 'host-b', namespace: 'tenant-a' },
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
          spec: { displayName: 'Host A', IPs: { IPv4: ['10.0.0.10'], IPv6: ['2001:db8::10'] } },
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

    expect(tree).toHaveLength(3)
    expect(tree.map(node => node.key)).toEqual(['hosts-root', 'networks-root', 'services-root'])
    expect(tree[0].children?.[0]).toEqual(expect.objectContaining({ key: 'hosts-root-namespace-tenant-a' }))
    expect(tree[0].children?.[0].children).toEqual([
      expect.objectContaining({
        key: 'hosts-root-host-tenant-a-host-binding-a',
        children: [
          { title: '10.0.0.10', key: 'hosts-root-host-tenant-a-host-binding-a-ip-10.0.0.10', isLeaf: true },
          { title: '2001:db8::10', key: 'hosts-root-host-tenant-a-host-binding-a-ip-2001:db8::10', isLeaf: true },
        ],
      }),
    ])
    expect(tree[1].children?.[0]).toEqual(expect.objectContaining({ key: 'networks-root-namespace-tenant-a' }))
    expect(tree[1].children?.[0].children).toEqual([
      expect.objectContaining({
        key: 'networks-root-network-tenant-a-network-binding-a',
        children: [
          { title: '10.0.0.0/24', key: 'networks-root-network-tenant-a-network-binding-a-cidr', isLeaf: true },
        ],
      }),
    ])
    expect(tree[2].children?.[0]).toEqual(expect.objectContaining({ key: 'services-root-namespace-tenant-a' }))
    expect(tree[2].children?.[0].children).toEqual([
      expect.objectContaining({
        key: 'services-root-service-tenant-a-service-binding-a',
        children: [
          expect.objectContaining({
            title: 'TCP / IPv4',
            key: 'services-root-service-tenant-a-service-binding-a-transport-0',
            children: [
              {
                title: 'Ports: 443',
                key: 'services-root-service-tenant-a-service-binding-a-transport-0-entry-0',
                isLeaf: true,
              },
            ],
          }),
        ],
      }),
    ])
  })

  it('adds empty leaves when no matching bindings exist', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
    })

    expect(tree[0].children).toEqual([{ title: 'No bound resources', key: 'hosts-root-empty', isLeaf: true }])
    expect(tree[1].children).toEqual([{ title: 'No bound resources', key: 'networks-root-empty', isLeaf: true }])
    expect(tree[2].children).toEqual([{ title: 'No bound resources', key: 'services-root-empty', isLeaf: true }])
  })

  it('keeps service transport entry description and comment in the tooltip', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      serviceBindings: [
        {
          metadata: { name: 'service-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            service: { name: 'svc-a', namespace: 'tenant-a' },
          },
        },
      ] as any,
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

    const title = tree[2].children?.[0].children?.[0].children?.[0].children?.[0].title

    render(title as React.ReactElement)

    expect(screen.getByText('Ports: 50004-50006')).toBeInTheDocument()
    expect(screen.queryByText(/Description:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Comment:/)).not.toBeInTheDocument()

    render(<>{getTooltipTitle(title)}</>)

    expect(screen.getByText(/range 50004-50006/)).toBeInTheDocument()
    expect(screen.getByText(/service note/)).toBeInTheDocument()
  })

  it('renders highlighted resources with an Added marker', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      hostBindings: [
        {
          metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            host: { name: 'host-a', namespace: 'tenant-a' },
          },
        },
      ] as any,
      hosts: [
        {
          metadata: { name: 'host-a', namespace: 'tenant-a' },
          spec: { displayName: 'Host A' },
        },
      ] as any,
      highlightedHosts: ['tenant-a/host-a'],
    })

    render(tree[0].children?.[0].children?.[0].title as React.ReactElement)

    expect(screen.getByText('Added')).toBeInTheDocument()
    expect(screen.getByText('Host A')).toBeInTheDocument()
  })

  it('marks missing resources as not found and uses error leaves when resource fetch failed', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      hostBindings: [
        {
          metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            host: { name: 'missing-host', namespace: 'tenant-a' },
          },
        },
      ] as any,
      networkBindings: [
        {
          metadata: { name: 'network-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            network: { name: 'missing-network', namespace: 'tenant-a' },
          },
        },
      ] as any,
      networksError: true,
    })

    expect(tree[0].children?.[0].children?.[0]).toEqual(
      expect.objectContaining({
        children: [{ title: 'Not found', key: 'hosts-root-host-tenant-a-host-binding-a-status', isLeaf: true }],
      }),
    )
    expect(tree[1].children?.[0].children?.[0]).toEqual(
      expect.objectContaining({
        children: [
          {
            title: 'Error while fetching',
            key: 'networks-root-network-tenant-a-network-binding-a-status',
            isLeaf: true,
          },
        ],
      }),
    )
  })

  it('uses binding namespace as a fallback for omitted host and network AddressGroup namespaces', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      hostBindings: [
        {
          metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            host: { name: 'host-a' },
          },
        },
      ] as any,
      networkBindings: [
        {
          metadata: { name: 'network-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a' },
            network: { name: 'network-a' },
          },
        },
      ] as any,
      hosts: [
        {
          metadata: { name: 'host-a', namespace: 'tenant-a' },
          spec: { displayName: 'Host A' },
        },
      ] as any,
      networks: [
        {
          metadata: { name: 'network-a', namespace: 'tenant-a' },
          spec: { CIDR: '10.0.0.0/24' },
        },
      ] as any,
    })

    expect(tree[0].children?.[0]).toEqual(expect.objectContaining({ key: 'hosts-root-namespace-tenant-a' }))
    expect(tree[0].children?.[0].children?.[0]).toEqual(
      expect.objectContaining({ key: 'hosts-root-host-tenant-a-host-binding-a' }),
    )
    expect(tree[1].children?.[0]).toEqual(expect.objectContaining({ key: 'networks-root-namespace-tenant-a' }))
    expect(tree[1].children?.[0].children?.[0]).toEqual(
      expect.objectContaining({ key: 'networks-root-network-tenant-a-network-binding-a' }),
    )
  })

  it('does not use ServiceBinding namespace as an AddressGroup namespace fallback', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      serviceBindings: [
        {
          metadata: { name: 'service-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a' },
            service: { name: 'svc-a' },
          },
        },
        {
          metadata: { name: 'service-binding-b', namespace: 'tenant-b' },
          spec: {
            addressGroup: { name: 'ag-a' },
            service: { name: 'svc-b' },
          },
        },
        {
          metadata: { name: 'service-binding-c', namespace: 'tenant-b' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            service: { name: 'svc-c' },
          },
        },
      ] as any,
      services: [
        {
          metadata: { name: 'svc-c', namespace: 'tenant-b' },
          spec: { displayName: 'Service C' },
        },
      ] as any,
    })

    const { container } = render(<>{tree[2].title}</>)

    expect(container.textContent).toBe('Services (1)')
    expect(tree[2].children?.[0]).toEqual(expect.objectContaining({ key: 'services-root-namespace-tenant-b' }))
    expect(tree[2].children?.[0].children?.[0]).toEqual(
      expect.objectContaining({ key: 'services-root-service-tenant-b-service-binding-c' }),
    )
  })

  it('uses branch-level error leaves when binding fetch failed', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      hostBindingsError: true,
      networkBindingsError: true,
      serviceBindingsError: true,
    })

    expect(tree[0].children).toEqual([{ title: 'Error while fetching', key: 'hosts-root-error', isLeaf: true }])
    expect(tree[1].children).toEqual([{ title: 'Error while fetching', key: 'networks-root-error', isLeaf: true }])
    expect(tree[2].children).toEqual([{ title: 'Error while fetching', key: 'services-root-error', isLeaf: true }])
  })

  it('scopes all generated keys when used inside a larger overview tree', () => {
    const tree = buildAddressGroupContentsTree({
      addressGroupName: 'ag-a',
      addressGroupNamespace: 'tenant-a',
      keyPrefix: 'overview-tenant-a/ag-a',
      serviceBindings: [
        {
          metadata: { name: 'service-binding-a', namespace: 'tenant-a' },
          spec: {
            addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
            service: { name: 'svc-a', namespace: 'tenant-a' },
          },
        },
      ] as any,
      services: [
        {
          metadata: { name: 'svc-a', namespace: 'tenant-a' },
          spec: {
            transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '443' }] }],
          },
        },
      ] as any,
    })

    expect(tree.map(node => node.key)).toEqual([
      'overview-tenant-a/ag-a-hosts-root',
      'overview-tenant-a/ag-a-networks-root',
      'overview-tenant-a/ag-a-services-root',
    ])
    expect(tree[2].children?.[0]).toEqual(
      expect.objectContaining({
        key: 'overview-tenant-a/ag-a-services-root-namespace-tenant-a',
      }),
    )
    expect(tree[2].children?.[0].children?.[0]).toEqual(
      expect.objectContaining({
        key: 'overview-tenant-a/ag-a-services-root-service-tenant-a-service-binding-a',
        children: [
          expect.objectContaining({
            key: 'overview-tenant-a/ag-a-services-root-service-tenant-a-service-binding-a-transport-0',
            children: [
              {
                title: 'Ports: 443',
                key: 'overview-tenant-a/ag-a-services-root-service-tenant-a-service-binding-a-transport-0-entry-0',
                isLeaf: true,
              },
            ],
          }),
        ],
      }),
    )
  })
})
