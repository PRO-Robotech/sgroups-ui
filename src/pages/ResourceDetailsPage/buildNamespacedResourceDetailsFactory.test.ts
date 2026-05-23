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
})
