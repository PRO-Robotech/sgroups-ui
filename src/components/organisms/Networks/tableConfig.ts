import React from 'react'
import { Button, TableProps, Tooltip } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { formatDateTime, renderBadgeWithValue, renderTimestampWithIcon } from 'utils'

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
}

const EMPTY_VALUE = '-'

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

export const mapNetworksToRows = (items: TNetworkResource[]): TNetworkRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
    displayName: item.spec?.displayName || EMPTY_VALUE,
    cidr: item.spec?.CIDR || EMPTY_VALUE,
    description: item.spec?.description || EMPTY_VALUE,
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

export const buildNetworksColumns = ({ onEdit }: TBuildNetworksColumnsParams = {}): ColumnsType<TNetworkRow> => {
  const columns: ColumnsType<TNetworkRow> = [
    {
      title: 'Name',
      dataIndex: ['metadata', 'name'],
      key: 'name',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.name, b.metadata.name),
      render: value => renderBadgeWithValue('Network', value),
    },
    {
      title: 'Namespace',
      dataIndex: ['metadata', 'namespace'],
      key: 'namespace',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.namespace, b.metadata.namespace),
      render: value => renderBadgeWithValue('Namespace', value),
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 180,
      sorter: (a, b) => stringSorter(a.displayName, b.displayName),
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

  if (onEdit) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) =>
        React.createElement(
          Tooltip,
          { title: 'Edit' },
          React.createElement(Button, {
            type: 'text',
            icon: React.createElement(EditOutlined),
            onClick: event => {
              event.stopPropagation()
              onEdit(record)
            },
          }),
        ),
    })
  }

  return columns
}

export const NETWORKS_TABLE_PROPS: Partial<TableProps<TNetworkRow>> = {
  pagination: {
    position: ['bottomLeft'],
    showSizeChanger: true,
    hideOnSinglePage: false,
  },
  scroll: { x: 1550 },
  size: 'middle',
}
