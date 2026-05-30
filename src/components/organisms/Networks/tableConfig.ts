import { TableProps } from 'antd'
import { ColumnsType } from 'antd/es/table'
import {
  formatDateTime,
  renderLinkedResourceBadge,
  renderNamespaceBadgeWithValue,
  renderTableActionsDropdown,
  renderTimestampWithIcon,
} from 'utils'

export type TNetworkRef = {
  kind?: string
  name?: string
  namespace?: string
}

export type TNetworkResource = {
  apiVersion?: string
  kind?: string
  metadata: {
    name?: string
    namespace?: string
    creationTimestamp?: string
    labels?: Record<string, string>
    annotations?: Record<string, string>
  }
  refs?: TNetworkRef[]
  spec?: {
    displayName?: string
    description?: string
    comment?: string
    CIDR?: string
  }
}

export type TNetworkRow = TNetworkResource & {
  key: string
  displayName: string
  cidr: string
  description: string
  created: string
}

type TBuildNetworksColumnsParams = {
  onEdit?: (record: TNetworkRow) => void
  onDelete?: (record: TNetworkRow) => void
}

const EMPTY_VALUE = '-'

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

export const mapNetworksToRows = (items: TNetworkResource[]): TNetworkRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
    displayName: item.spec?.displayName || item.metadata.name || EMPTY_VALUE,
    cidr: item.spec?.CIDR || EMPTY_VALUE,
    description: item.spec?.description || EMPTY_VALUE,
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

export const buildNetworksColumns = ({
  onDelete,
  onEdit,
}: TBuildNetworksColumnsParams = {}): ColumnsType<TNetworkRow> => {
  const columns: ColumnsType<TNetworkRow> = [
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => stringSorter(a.displayName, b.displayName),
      render: (value, record) =>
        renderLinkedResourceBadge({
          badgeValue: 'Network',
          displayValue: value,
          name: record.metadata.name,
          namespace: record.metadata.namespace,
          plural: 'networks',
        }),
    },
    {
      title: 'Tenant',
      dataIndex: ['metadata', 'namespace'],
      key: 'namespace',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.namespace, b.metadata.namespace),
      render: value => renderNamespaceBadgeWithValue(value),
    },
    {
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
      width: 220,
      sorter: (a, b) => stringSorter(a.cidr, b.cidr),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 260,
      sorter: (a, b) => stringSorter(a.description, b.description),
      ellipsis: true,
    },
    {
      title: 'Created',
      dataIndex: ['metadata', 'creationTimestamp'],
      key: 'created',
      width: 180,
      sorter: (a, b) =>
        new Date(a.metadata.creationTimestamp || 0).getTime() - new Date(b.metadata.creationTimestamp || 0).getTime(),
      render: value => renderTimestampWithIcon(value),
    },
  ]

  if (onEdit || onDelete) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      className: 'controls',
      fixed: 'right',
      width: 120,
      render: (_, record) =>
        renderTableActionsDropdown({
          label: record.displayName || 'network',
          onDelete,
          onEdit,
          record,
        }),
    })
  }

  return columns
}

export const NETWORKS_TABLE_PROPS: Partial<TableProps<TNetworkRow>> = {
  pagination: false,
  scroll: { x: 1550 },
  size: 'middle',
}
