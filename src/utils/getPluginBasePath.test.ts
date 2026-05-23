import { getPluginBasePath } from './getPluginBasePath'

describe('getPluginBasePath', () => {
  it('returns plugin base path from resource detail routes', () => {
    expect(getPluginBasePath('/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts/tenant-a/host-a')).toBe(
      '/openapi-ui/cluster-a/plugins/plugin-sgroups',
    )
    expect(getPluginBasePath('/openapi-ui/cluster-a/plugins/plugin-sgroups/services/tenant-a/service-a')).toBe(
      '/openapi-ui/cluster-a/plugins/plugin-sgroups',
    )
  })

  it('returns plugin base path from module table routes', () => {
    expect(getPluginBasePath('/openapi-ui/cluster-a/plugins/plugin-sgroups/networks')).toBe(
      '/openapi-ui/cluster-a/plugins/plugin-sgroups',
    )
  })

  it('returns the original path for unknown routes', () => {
    expect(getPluginBasePath('/openapi-ui/cluster-a/plugins/plugin-sgroups/unknown')).toBe(
      '/openapi-ui/cluster-a/plugins/plugin-sgroups/unknown',
    )
  })
})
