import { buildNamespacedResourceDetailsFactory } from './buildNamespacedResourceDetailsFactory'
import { SGROUPS_RESOURCE_DETAILS_CONFIG } from './resourceDetailsConfig'

const collectByType = (items: unknown[], type: string): Array<{ type?: string; data?: Record<string, unknown> }> => {
  const matches: Array<{ type?: string; data?: Record<string, unknown> }> = []

  const visit = (item: unknown) => {
    if (!item || typeof item !== 'object') {
      return
    }

    const node = item as { type?: string; data?: Record<string, unknown>; children?: unknown[] }

    if (node.type === type) {
      matches.push(node)
    }

    node.children?.forEach(visit)

    const tabItems = node.data?.items
    if (Array.isArray(tabItems)) {
      tabItems.forEach(visit)
    }
  }

  items.forEach(visit)

  return matches
}

describe('buildNamespacedResourceDetailsFactory', () => {
  it('uses display name for the visible dropdown value while keeping metadata name in requests', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.hosts,
      displayName: 'Production Host',
      name: 'host-a',
      namespace: 'tenant-a',
    })
    const dropdown = collectByType(factory.data, 'DropdownRedirect')[0]

    expect(factory.urlsToFetch).toEqual([
      expect.objectContaining({
        fieldSelector: 'metadata.name=host-a',
        namespace: 'tenant-a',
        plural: 'hosts',
      }),
    ])
    expect(dropdown.data).toEqual(
      expect.objectContaining({
        currentValue: 'host-a',
        labelJsonPath: '.spec.displayName',
        redirectUrl: '/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts/tenant-a/{chosenEntryValue}',
      }),
    )
  })

  it('does not include the generic events tab for sgroups details', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.services,
      displayName: 'API Service',
      name: 'service-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(factory.data, 'Events')).toEqual([])
    expect(collectByType(factory.data, 'YamlEditorSingleton')).toHaveLength(1)
  })

  it('configures custom resource actions without delete redirect data', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.hosts,
      displayName: 'Production Host',
      name: 'host-a',
      namespace: 'tenant-a',
    })

    const actionsDropdown = collectByType(factory.data, 'SgroupsResourceActionsDropdown')[0]

    expect(actionsDropdown.data).toEqual({
      clusterId: 'cluster-a',
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a',
      kind: 'Host',
      name: 'host-a',
      namespace: 'tenant-a',
      plural: 'hosts',
    })
    expect(actionsDropdown.data).not.toHaveProperty('redirectTo')
  })

  it('uses the custom Host details section for Host resources', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.hosts,
      displayName: 'Production Host',
      name: 'host-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(factory.data, 'SgroupsHostDetailsSection')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'host-a',
      namespace: 'tenant-a',
    })
  })

  it('uses the custom AddressGroup details section for AddressGroup resources', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.addressgroups,
      displayName: 'Production Address Group',
      name: 'ag-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(factory.data, 'SgroupsAddressGroupDetailsSection')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'ag-a',
      namespace: 'tenant-a',
    })
  })

  it('adds the AddressGroup rules tab only for AddressGroup resources', () => {
    const addressGroupFactory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.addressgroups,
      displayName: 'Production Address Group',
      name: 'ag-a',
      namespace: 'tenant-a',
    })
    const hostFactory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.hosts,
      displayName: 'Production Host',
      name: 'host-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(addressGroupFactory.data, 'SgroupsAddressGroupRulesTab')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'ag-a',
      namespace: 'tenant-a',
    })
    expect(collectByType(hostFactory.data, 'SgroupsAddressGroupRulesTab')).toEqual([])
  })

  it('adds AddressGroup Hosts, Networks, and Services tabs only for AddressGroup resources', () => {
    const addressGroupFactory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.addressgroups,
      displayName: 'Production Address Group',
      name: 'ag-a',
      namespace: 'tenant-a',
    })
    const serviceFactory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.services,
      displayName: 'API Service',
      name: 'service-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(addressGroupFactory.data, 'SgroupsAddressGroupEntitiesTab').map(item => item.data)).toEqual([
      { clusterId: 'cluster-a', kind: 'hosts', name: 'ag-a', namespace: 'tenant-a' },
      { clusterId: 'cluster-a', kind: 'networks', name: 'ag-a', namespace: 'tenant-a' },
      { clusterId: 'cluster-a', kind: 'services', name: 'ag-a', namespace: 'tenant-a' },
    ])
    expect(collectByType(serviceFactory.data, 'SgroupsAddressGroupEntitiesTab')).toEqual([])
  })

  it('uses the custom Service details section for Service resources', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.services,
      displayName: 'API Service',
      name: 'service-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(factory.data, 'SgroupsServiceDetailsSection')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'service-a',
      namespace: 'tenant-a',
    })
  })

  it('adds Service AddressGroups and Rules tabs only for Service resources', () => {
    const serviceFactory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.services,
      displayName: 'API Service',
      name: 'service-a',
      namespace: 'tenant-a',
    })
    const networkFactory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.networks,
      displayName: 'Production Network',
      name: 'network-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(serviceFactory.data, 'SgroupsServiceAddressGroupsTab')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'service-a',
      namespace: 'tenant-a',
    })
    expect(collectByType(serviceFactory.data, 'SgroupsServiceRulesTab')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'service-a',
      namespace: 'tenant-a',
    })
    expect(collectByType(networkFactory.data, 'SgroupsServiceAddressGroupsTab')).toEqual([])
    expect(collectByType(networkFactory.data, 'SgroupsServiceRulesTab')).toEqual([])
  })

  it('uses the custom Network details section for Network resources', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.networks,
      displayName: 'Production Network',
      name: 'network-a',
      namespace: 'tenant-a',
    })

    expect(collectByType(factory.data, 'SgroupsNetworkDetailsSection')[0].data).toEqual({
      clusterId: 'cluster-a',
      name: 'network-a',
      namespace: 'tenant-a',
    })
  })
})
