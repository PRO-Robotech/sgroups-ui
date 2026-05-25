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
        currentValue: 'Production Host',
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

  it('does not redirect when the delete modal is closed', () => {
    const factory = buildNamespacedResourceDetailsFactory({
      basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
      clusterId: 'cluster-a',
      config: SGROUPS_RESOURCE_DETAILS_CONFIG.hosts,
      displayName: 'Production Host',
      name: 'host-a',
      namespace: 'tenant-a',
    })

    const actionsDropdown = collectByType(factory.data, 'ActionsDropdown')[0]
    const actions = actionsDropdown.data?.actions as Array<{ props?: Record<string, unknown>; type?: string }>
    const deleteAction = actions.find(action => action.type === 'delete')

    expect(deleteAction?.props).not.toHaveProperty('redirectTo')
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
