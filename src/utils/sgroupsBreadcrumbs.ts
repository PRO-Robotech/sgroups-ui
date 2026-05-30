import type { TSgroupsBreadcrumbLink } from 'components/molecules/SgroupsBreadcrumbs'

export const buildSgroupsResourceDetailsBreadcrumbs = ({
  basePath,
  resourceName,
  resourceTitle,
  plural,
}: {
  basePath: string
  resourceName: string
  resourceTitle: string
  plural: string
}): TSgroupsBreadcrumbLink[] => [
  {
    key: plural,
    label: resourceTitle,
    link: `${basePath}/${plural}`,
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
