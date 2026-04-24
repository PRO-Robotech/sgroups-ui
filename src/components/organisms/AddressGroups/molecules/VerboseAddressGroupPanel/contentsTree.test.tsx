/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildAddressGroupContentsTree } from './contentsTree'

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
    expect(tree[0].children).toEqual([
      expect.objectContaining({
        title: 'Host A (tenant-a)',
        key: 'host-tenant-a-host-binding-a',
        children: [
          { title: '10.0.0.10', key: 'host-tenant-a::host-a-10.0.0.10', isLeaf: true },
          { title: '2001:db8::10', key: 'host-tenant-a::host-a-2001:db8::10', isLeaf: true },
        ],
      }),
    ])
    expect(tree[1].children).toEqual([
      expect.objectContaining({
        title: 'Network A (tenant-a)',
        key: 'network-tenant-a-network-binding-a',
        children: [{ title: '10.0.0.0/24', key: 'network-tenant-a::net-a-cidr', isLeaf: true }],
      }),
    ])
    expect(tree[2].children).toEqual([
      expect.objectContaining({
        title: 'Service A (tenant-a)',
        key: 'service-tenant-a-service-binding-a',
        children: [
          expect.objectContaining({
            title: 'TCP / IPv4',
            key: 'service-tenant-a::svc-a-transport-0',
            children: [{ title: 'Ports: 443', key: 'service-tenant-a::svc-a-entry-0', isLeaf: true }],
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

    expect(tree[0].children?.[0]).toEqual(
      expect.objectContaining({
        title: 'missing-host (tenant-a)',
        children: [{ title: 'Not found', key: 'host-tenant-a::missing-host-status', isLeaf: true }],
      }),
    )
    expect(tree[1].children?.[0]).toEqual(
      expect.objectContaining({
        title: 'missing-network (tenant-a)',
        children: [{ title: 'Error while fetching', key: 'network-tenant-a::missing-network-status', isLeaf: true }],
      }),
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

    expect(tree[0].children).toEqual([{ title: 'Error while fetching', key: 'hosts-error', isLeaf: true }])
    expect(tree[1].children).toEqual([{ title: 'Error while fetching', key: 'networks-error', isLeaf: true }])
    expect(tree[2].children).toEqual([{ title: 'Error while fetching', key: 'services-error', isLeaf: true }])
  })
})
