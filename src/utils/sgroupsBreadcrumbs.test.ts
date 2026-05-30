import { buildSgroupsResourceDetailsBreadcrumbs } from './sgroupsBreadcrumbs'

describe('sgroupsBreadcrumbs', () => {
  it('builds detail breadcrumbs without a tenant or namespace item', () => {
    expect(
      buildSgroupsResourceDetailsBreadcrumbs({
        basePath: '/openapi-ui/cluster-a/plugins/plugin-sgroups',
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
