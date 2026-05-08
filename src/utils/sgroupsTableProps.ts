import { TEnrichedTableProps } from '@prorobotech/openapi-k8s-toolkit'
import { TableProps } from 'antd'

const DEFAULT_SCROLL_Y = 320

export const getSgroupsTableProps = (
  scrollX: NonNullable<TableProps['scroll']>['x'] | undefined,
  scrollY?: number,
): TEnrichedTableProps['tableProps'] => ({
  borderless: true,
  isTotalLeft: true,
  disablePagination: true,
  scroll: { x: scrollX || 'max-content', y: scrollY || DEFAULT_SCROLL_Y },
})
