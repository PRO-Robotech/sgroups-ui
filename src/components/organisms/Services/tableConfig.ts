import React from 'react'
import { TableProps, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { formatDateTime, renderBadgeWithValue, renderTimestampWithIcon } from 'utils'

export type TServiceRef = {
  kind?: string
  name?: string
  namespace?: string
}

export type TServiceTransportEntry = {
  comment?: string
  description?: string
  ports?: string
  types?: number[]
}

export type TServiceTransport = {
  IPv?: 'IPv4' | 'IPv6'
  protocol?: 'TCP' | 'UDP' | 'ICMP'
  entries?: TServiceTransportEntry[]
}

export type TServiceResource = {
  apiVersion?: string
  kind?: string
  metadata: {
    name?: string
    namespace?: string
    creationTimestamp?: string
    labels?: Record<string, string>
    annotations?: Record<string, string>
  }
  refs?: TServiceRef[]
  spec?: {
    displayName?: string
    description?: string
    comment?: string
    transports?: TServiceTransport[]
  }
}

export type TServiceRow = TServiceResource & {
  key: string
  displayName: string
  protocols: string
  ipFamilies: string
  transportEntries: string
  transportsCount: number
  description: string
  created: string
}

const EMPTY_VALUE = '-'

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

const formatUniqueTransportValues = (
  transports: TServiceTransport[] | undefined,
  pickValue: (transport: TServiceTransport) => string | undefined,
) => {
  if (!transports || transports.length === 0) {
    return EMPTY_VALUE
  }

  const values = Array.from(new Set(transports.map(pickValue).filter(Boolean)))

  return values.length > 0 ? values.join(', ') : EMPTY_VALUE
}

const formatTransportEntriesSummary = (transports?: TServiceTransport[]) => {
  if (!transports || transports.length === 0) {
    return EMPTY_VALUE
  }

  const entries = transports.flatMap(transport => transport.entries || [])

  if (entries.length === 0) {
    return EMPTY_VALUE
  }

  return (
    entries
      .map(entry => {
        const parts = []

        if (entry.ports) {
          parts.push(`Ports: ${entry.ports}`)
        }

        if (entry.types && entry.types.length > 0) {
          parts.push(`Types: ${entry.types.join(', ')}`)
        }

        return parts.join(' | ')
      })
      .filter(Boolean)
      .join(' || ') || EMPTY_VALUE
  )
}

const renderTagList = (values: string[]) => {
  if (values.length === 0) {
    return EMPTY_VALUE
  }

  return React.createElement(
    React.Fragment,
    null,
    ...values.map(value => React.createElement(Tag, { key: value }, value)),
  )
}

export const mapServicesToRows = (items: TServiceResource[]): TServiceRow[] =>
  items.map(item => {
    const transports = item.spec?.transports || []

    return {
      ...item,
      key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
      displayName: item.spec?.displayName || EMPTY_VALUE,
      protocols: formatUniqueTransportValues(transports, transport => transport.protocol),
      ipFamilies: formatUniqueTransportValues(transports, transport => transport.IPv),
      transportEntries: formatTransportEntriesSummary(transports),
      transportsCount: transports.length,
      description: item.spec?.description || EMPTY_VALUE,
      created: formatDateTime(item.metadata.creationTimestamp),
    }
  })

export const buildServicesColumns = (): ColumnsType<TServiceRow> => [
  {
    title: 'Name',
    dataIndex: ['metadata', 'name'],
    key: 'name',
    fixed: 'left',
    width: 180,
    sorter: (a, b) => stringSorter(a.metadata.name, b.metadata.name),
    render: value => renderBadgeWithValue('Service', value),
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
    title: 'Protocols',
    dataIndex: 'protocols',
    key: 'protocols',
    width: 180,
    sorter: (a, b) => stringSorter(a.protocols, b.protocols),
    render: value => (value === EMPTY_VALUE ? value : renderTagList(value.split(', '))),
  },
  {
    title: 'IP Families',
    dataIndex: 'ipFamilies',
    key: 'ipFamilies',
    width: 180,
    sorter: (a, b) => stringSorter(a.ipFamilies, b.ipFamilies),
    render: value => (value === EMPTY_VALUE ? value : renderTagList(value.split(', '))),
  },
  {
    title: 'Transports',
    dataIndex: 'transportsCount',
    key: 'transportsCount',
    width: 120,
    sorter: (a, b) => a.transportsCount - b.transportsCount,
  },
  {
    title: 'Entries',
    dataIndex: 'transportEntries',
    key: 'transportEntries',
    width: 320,
    sorter: (a, b) => stringSorter(a.transportEntries, b.transportEntries),
    ellipsis: true,
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

export const SERVICES_TABLE_PROPS: Partial<TableProps<TServiceRow>> = {
  pagination: {
    position: ['bottomLeft'],
    showSizeChanger: true,
    hideOnSinglePage: false,
  },
  scroll: { x: 1900 },
  size: 'middle',
}
