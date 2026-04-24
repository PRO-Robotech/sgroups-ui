import React from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Space, TableProps, Tag, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { formatDateTime, renderBadgeWithValue, renderTimestampWithIcon } from 'utils'

export type THostRef = {
  kind?: string
  name?: string
  namespace?: string
}

export type THostResource = {
  apiVersion?: string
  kind?: string
  metadata: {
    name?: string
    namespace?: string
    creationTimestamp?: string
    labels?: Record<string, string>
    annotations?: Record<string, string>
  }
  spec?: {
    displayName?: string
    description?: string
    comment?: string
    IPs?: {
      IPv4?: string[]
      IPv6?: string[]
    }
    metaInfo?: {
      hostName?: string
      os?: string
      platform?: string
      platformFamily?: string
      platformVersion?: string
      kernelVersion?: string
    }
  }
  metaInfo?: {
    hostName?: string
    os?: string
    platform?: string
    platformFamily?: string
    platformVersion?: string
    kernelVersion?: string
  }
  ips?: {
    IPv4?: string[]
    IPv6?: string[]
  }
  refs?: THostRef[]
}

export type THostRow = THostResource & {
  key: string
  displayName: string
  hostName: string
  ipv4: string[]
  ipv6: string[]
  os: string
  platform: string
  description: string
  created: string
}

type TBuildHostsColumnsParams = {
  onEdit?: (record: THostRow) => void
  onDelete?: (record: THostRow) => void
}

const EMPTY_VALUE = '-'

export const mapHostsToRows = (items: THostResource[]): THostRow[] =>
  items.map(item => {
    const normalizedIps = item.ips || item.spec?.IPs || {}
    const normalizedMetaInfo = item.metaInfo || item.spec?.metaInfo || {}

    return {
      ...item,
      ips: normalizedIps,
      metaInfo: normalizedMetaInfo,
      key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
      displayName: item.spec?.displayName || EMPTY_VALUE,
      hostName: normalizedMetaInfo.hostName || EMPTY_VALUE,
      ipv4: normalizedIps.IPv4 || [],
      ipv6: normalizedIps.IPv6 || [],
      os: normalizedMetaInfo.os || EMPTY_VALUE,
      platform: normalizedMetaInfo.platform || EMPTY_VALUE,
      description: item.spec?.description || EMPTY_VALUE,
      created: formatDateTime(item.metadata.creationTimestamp),
    }
  })

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

const arrayLengthSorter = (first?: string[], second?: string[]): number => (first?.length || 0) - (second?.length || 0)

const renderTagList = (values?: string[]) => {
  if (!values || values.length === 0) {
    return EMPTY_VALUE
  }

  return React.createElement(
    React.Fragment,
    null,
    ...values.map(value => React.createElement(Tag, { key: value }, value)),
  )
}

export const buildHostsColumns = ({ onDelete, onEdit }: TBuildHostsColumnsParams = {}): ColumnsType<THostRow> => {
  const columns: ColumnsType<THostRow> = [
    {
      title: 'Name',
      dataIndex: ['metadata', 'name'],
      key: 'name',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.name, b.metadata.name),
      render: value => renderBadgeWithValue('Host', value),
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
      title: 'Host Name',
      dataIndex: 'hostName',
      key: 'hostName',
      width: 180,
      sorter: (a, b) => stringSorter(a.hostName, b.hostName),
    },
    {
      title: 'IPv4',
      dataIndex: 'ipv4',
      key: 'ipv4',
      width: 220,
      sorter: (a, b) => arrayLengthSorter(a.ipv4, b.ipv4),
      render: value => renderTagList(value),
    },
    {
      title: 'IPv6',
      dataIndex: 'ipv6',
      key: 'ipv6',
      width: 240,
      sorter: (a, b) => arrayLengthSorter(a.ipv6, b.ipv6),
      render: value => renderTagList(value),
    },
    {
      title: 'OS',
      dataIndex: 'os',
      key: 'os',
      width: 140,
      sorter: (a, b) => stringSorter(a.os, b.os),
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 160,
      sorter: (a, b) => stringSorter(a.platform, b.platform),
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
      fixed: 'right',
      width: 120,
      render: (_, record) =>
        React.createElement(
          Space,
          { size: 4 },
          onEdit &&
            React.createElement(
              Tooltip,
              { title: 'Edit' },
              React.createElement(Button, {
                'aria-label': `Edit ${record.metadata.name || 'host'}`,
                type: 'text',
                icon: React.createElement(EditOutlined),
                onClick: event => {
                  event.stopPropagation()
                  onEdit(record)
                },
              }),
            ),
          onDelete &&
            React.createElement(
              Tooltip,
              { title: 'Delete' },
              React.createElement(Button, {
                'aria-label': `Delete ${record.metadata.name || 'host'}`,
                danger: true,
                type: 'text',
                icon: React.createElement(DeleteOutlined),
                onClick: event => {
                  event.stopPropagation()
                  onDelete(record)
                },
              }),
            ),
        ),
    })
  }

  return columns
}

export const HOSTS_TABLE_PROPS: Partial<TableProps<THostRow>> = {
  pagination: {
    position: ['bottomLeft'],
    showSizeChanger: true,
    hideOnSinglePage: false,
  },
  scroll: { x: 1790 },
  size: 'middle',
}
