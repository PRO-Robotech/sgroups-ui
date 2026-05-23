import { buildSgroupsResourceDetailsBreadcrumbs } from './sgroupsBreadcrumbs'

describe('sgroupsBreadcrumbs', () => {
  it('builds breadcrumbs back to the module table using display name as the visible resource label', () => {
    expect(
      buildSgroupsResourceDetailsBreadcrumbs({
        basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
        namespace: 'tenant-a',
        plural: 'hosts',
        resourceName: 'Production Host',
        resourceTitle: 'Host',
      }),
    ).toEqual([
      {
        key: 'hosts',
        label: 'Host',
        link: '/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts',
      },
      {
        key: 'namespace',
        label: 'tenant-a',
      },
      {
        key: 'resource-name',
        label: 'Production Host',
      },
      {
        key: 'details',
        label: 'Details',
      },
    ])
  })
})
