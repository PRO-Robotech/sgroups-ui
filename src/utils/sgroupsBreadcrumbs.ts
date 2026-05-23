import type { TSgroupsBreadcrumbLink } from 'components/molecules/SgroupsBreadcrumbs'

export const buildSgroupsResourceDetailsBreadcrumbs = ({
  basePath,
  resourceName,
  resourceTitle,
  namespace,
  plural,
}: {
  basePath: string
  resourceName: string
  resourceTitle: string
  namespace: string
  plural: string
}): TSgroupsBreadcrumbLink[] => [
  {
    key: plural,
    label: resourceTitle,
    link: `${basePath}/${plural}`,
  },
  {
    key: 'namespace',
    label: namespace,
  },
  {
    key: 'resource-name',
    label: resourceName,
  },
  {
    key: 'details',
    label: 'Details',
  },
]
