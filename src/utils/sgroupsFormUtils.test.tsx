import {
  buildNamespacedValue,
  compactSpec,
  FQDN_PATTERN,
  getApiEndpoint,
  getBindingLookupKey,
  getNamespacedResourceOptions,
  getNamespaceOptions,
  getScopedResourceOptions,
  NAME_PATTERN,
  normalizeOptionalString,
  parseNamespacedValue,
  PORT_VALUE_SEPARATOR,
  runSequentialRequests,
  sanitizeBindingName,
  validateCIDR,
  validateNetworkCIDR,
  validatePortToken,
} from './sgroupsFormUtils'

describe('sgroupsFormUtils', () => {
  it('builds API endpoints and compacts specs', () => {
    expect(getApiEndpoint('cluster-a', 'tenant-a', 'hosts')).toBe(
      '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts',
    )
    expect(
      compactSpec({
        displayName: 'Host A',
        description: '',
        comment: undefined,
        logs: false,
      }),
    ).toEqual({
      displayName: 'Host A',
      logs: false,
    })
  })

  it('normalizes strings and binding names', () => {
    expect(normalizeOptionalString('  value  ')).toBe('value')
    expect(normalizeOptionalString('   ')).toBeUndefined()
    expect(sanitizeBindingName('AG A / Service_Name!!')).toBe('ag-a-service-name')
    expect(sanitizeBindingName('---')).toBe('binding')
    expect(sanitizeBindingName(`name-${'x'.repeat(80)}`)).toHaveLength(63)
  })

  it('runs request thunks one at a time', async () => {
    const order: string[] = []

    const requestCount = await runSequentialRequests([
      async () => {
        order.push('first-start')
        await Promise.resolve()
        order.push('first-end')
      },
      async () => {
        order.push('second-start')
        await Promise.resolve()
        order.push('second-end')
      },
    ])

    expect(requestCount).toBe(2)
    expect(order).toEqual(['first-start', 'first-end', 'second-start', 'second-end'])
  })

  it('parses, builds, and looks up namespaced resource values', () => {
    expect(parseNamespacedValue()).toEqual({})
    expect(parseNamespacedValue('tenant-a/resource/name')).toEqual({
      namespace: 'tenant-a',
      name: 'resource/name',
    })
    expect(buildNamespacedValue({ namespace: 'tenant-a', name: 'resource-a' })).toBe('tenant-a/resource-a')
    expect(buildNamespacedValue({ namespace: 'tenant-a' })).toBeUndefined()
    expect(getBindingLookupKey({ namespace: 'tenant-a', name: 'resource-a' })).toBe('tenant-a/resource-a')
    expect(getBindingLookupKey({ name: 'resource-a' })).toBe('/resource-a')
    expect(getBindingLookupKey()).toBeNull()
  })

  it('builds sorted namespace and namespaced resource options', () => {
    expect(
      getNamespaceOptions([{ metadata: { name: 'zeta' } }, { metadata: {} }, { metadata: { name: 'alpha' } }]),
    ).toEqual([
      { value: 'alpha', label: 'alpha' },
      { value: 'zeta', label: 'zeta' },
    ])

    const options = getNamespacedResourceOptions(
      [
        { metadata: { namespace: 'tenant-b', name: 'svc-b' }, spec: { displayName: 'Backend' } },
        { metadata: { namespace: 'tenant-a', name: 'svc-a' } },
        { metadata: { namespace: 'tenant-c' } },
      ],
      'Service',
    )

    expect(options.map(option => ({ value: option.value, searchText: option.searchText }))).toEqual([
      { value: 'tenant-a/svc-a', searchText: 'tenant-a svc-a' },
      { value: 'tenant-b/svc-b', searchText: 'tenant-b svc-b Backend' },
    ])
  })

  it('scopes namespaced options to a selected namespace', () => {
    expect(
      getScopedResourceOptions(
        [
          { value: 'tenant-a/ag-a', label: 'A', searchText: 'tenant-a ag-a' },
          { value: 'tenant-b/ag-b', label: 'B', searchText: 'tenant-b ag-b' },
        ],
        'tenant-a',
      ),
    ).toEqual([{ value: 'ag-a', label: 'A', searchText: 'tenant-a ag-a' }])
    expect(getScopedResourceOptions([], undefined)).toEqual([])
  })

  it('validates Kubernetes names and FQDNs with exported patterns', () => {
    expect(NAME_PATTERN.test('valid-name-1')).toBe(true)
    expect(NAME_PATTERN.test('Invalid')).toBe(false)
    expect(NAME_PATTERN.test('-invalid')).toBe(false)
    expect(FQDN_PATTERN.test('api.example.com')).toBe(true)
    expect(FQDN_PATTERN.test('-api.example.com')).toBe(false)
    expect(FQDN_PATTERN.test('localhost')).toBe(false)
  })

  it('validates IPv4 and IPv6 CIDRs', () => {
    expect(validateCIDR('10.0.0.0/8')).toBe(true)
    expect(validateCIDR('192.168.1.0/24')).toBe(true)
    expect(validateCIDR('2001:db8::/64')).toBe(true)
    expect(validateCIDR('2001:db8:0:0:0:0:0:1/128')).toBe(true)
    expect(validateCIDR('10.0.0.0/33')).toBe(false)
    expect(validateCIDR('01.0.0.0/8')).toBe(false)
    expect(validateCIDR('256.0.0.0/8')).toBe(false)
    expect(validateCIDR('2001:db8::/129')).toBe(false)
    expect(validateCIDR('2001:db8:::/64')).toBe(false)
    expect(validateCIDR('not-a-cidr')).toBe(false)
    expect(validateCIDR('   ')).toBe(false)
  })

  it('validates network CIDRs with zero host bits', () => {
    expect(validateNetworkCIDR('10.0.0.0/8')).toBe(true)
    expect(validateNetworkCIDR('0.0.0.0/0')).toBe(true)
    expect(validateNetworkCIDR('192.168.1.0/24')).toBe(true)
    expect(validateNetworkCIDR('2001:db8::/64')).toBe(true)
    expect(validateNetworkCIDR('::/0')).toBe(true)
    expect(validateNetworkCIDR('5.5.5.5/8')).toBe(false)
    expect(validateNetworkCIDR('::1/8')).toBe(false)
    expect(validateNetworkCIDR('1.1.1.1')).toBe(false)
  })

  it('validates port tokens and comma-separated separators', () => {
    expect(validatePortToken('1')).toBe(true)
    expect(validatePortToken('65535')).toBe(true)
    expect(validatePortToken('1000-2000')).toBe(true)
    expect(validatePortToken('0')).toBe(false)
    expect(validatePortToken('65536')).toBe(false)
    expect(validatePortToken('2000-1000')).toBe(false)
    expect(validatePortToken('abc')).toBe(false)

    expect('80, 443,1000-2000'.split(PORT_VALUE_SEPARATOR)).toEqual(['80', '443', '1000-2000'])
  })
})
