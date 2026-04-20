import React from 'react'
import { TableProps, Tag } from 'antd'
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
  }
  metaInfo?: {
    hostName?: string
    os?: string
    platform?: string
    platformFamily?: string
    platformVersion?: string
    kernelVersion?: string
  }
  ips: {
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

const EMPTY_VALUE = '-'

export const mapHostsToRows = (items: THostResource[]): THostRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
    displayName: item.spec?.displayName || EMPTY_VALUE,
    hostName: item.metaInfo?.hostName || EMPTY_VALUE,
    ipv4: item.ips?.IPv4 || [],
    ipv6: item.ips?.IPv6 || [],
    os: item.metaInfo?.os || EMPTY_VALUE,
    platform: item.metaInfo?.platform || EMPTY_VALUE,
    description: item.spec?.description || EMPTY_VALUE,
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

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

export const buildHostsColumns = (): ColumnsType<THostRow> => [
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

export const HOSTS_TABLE_PROPS: Partial<TableProps<THostRow>> = {
  pagination: {
    position: ['bottomLeft'],
    showSizeChanger: true,
    hideOnSinglePage: false,
  },
  scroll: { x: 1700 },
  size: 'middle',
}
