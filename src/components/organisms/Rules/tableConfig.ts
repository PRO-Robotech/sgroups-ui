import React from 'react'
import { Button, Space, TableProps, Tag, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { formatDateTime, formatTrafficValue, renderBadgeWithValue, renderTimestampWithIcon } from 'utils'

export type TRuleEndpointType = 'AddressGroup' | 'Service' | 'FQDN' | 'CIDR'

export type TRuleEndpoint = {
  type?: TRuleEndpointType
  name?: string
  namespace?: string
  value?: string
  labels?: Record<string, string>
}

export type TRuleTransportEntry = {
  comment?: string
  description?: string
  ports?: string
  types?: number[]
}

export type TRuleTransport = {
  IPv?: 'IPv4' | 'IPv6'
  protocol?: 'TCP' | 'UDP' | 'ICMP'
  entries?: TRuleTransportEntry[]
}

export type TRuleSession = {
  traffic?: 'both' | 'ingress' | 'egress'
}

export type TRuleResource = {
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
    action?: 'Allow' | 'Deny'
    session?: TRuleSession
    transport?: TRuleTransport
    endpoints?: {
      local?: TRuleEndpoint
      remote?: TRuleEndpoint
    }
  }
}

export type TRuleRow = TRuleResource & {
  key: string
  displayName: string
  action: string
  traffic: string
  protocol: string
  ipFamily: string
  localEndpoint: string
  remoteEndpoint: string
  description: string
  created: string
}

type TBuildRulesColumnsParams = {
  onEdit?: (record: TRuleRow) => void
  onDelete?: (record: TRuleRow) => void
}

const EMPTY_VALUE = '-'

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

const renderActionTag = (value?: string) => {
  if (!value || value === EMPTY_VALUE) {
    return EMPTY_VALUE
  }

  return React.createElement(Tag, { color: value === 'Allow' ? 'green' : 'red' }, value)
}

const formatEndpointLabel = (endpoint?: TRuleEndpoint): string => {
  if (!endpoint) {
    return EMPTY_VALUE
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    return endpoint.value || EMPTY_VALUE
  }

  const name = endpoint.name || endpoint.value

  if (!name) {
    return EMPTY_VALUE
  }

  return endpoint.namespace ? `${name} (${endpoint.namespace})` : name
}

const formatTransportSummary = (field: 'ports' | 'types', entries?: TRuleTransportEntry[]) => {
  if (!entries || entries.length === 0) {
    return EMPTY_VALUE
  }

  const values = entries.flatMap(entry => {
    if (field === 'ports') {
      return entry.ports ? [entry.ports] : []
    }

    return entry.types && entry.types.length > 0 ? [entry.types.join(', ')] : []
  })

  return values.length > 0 ? values.join(' | ') : EMPTY_VALUE
}

export const mapRulesToRows = (items: TRuleResource[]): TRuleRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
    displayName: item.spec?.displayName || EMPTY_VALUE,
    action: item.spec?.action || EMPTY_VALUE,
    traffic: formatTrafficValue(item.spec?.session?.traffic),
    protocol: item.spec?.transport?.protocol || EMPTY_VALUE,
    ipFamily: item.spec?.transport?.IPv || EMPTY_VALUE,
    localEndpoint: formatEndpointLabel(item.spec?.endpoints?.local),
    remoteEndpoint: formatEndpointLabel(item.spec?.endpoints?.remote),
    description: item.spec?.description || EMPTY_VALUE,
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

export const buildRulesColumns = ({ onDelete, onEdit }: TBuildRulesColumnsParams = {}): ColumnsType<TRuleRow> => {
  const columns: ColumnsType<TRuleRow> = [
    {
      title: 'Name',
      dataIndex: ['metadata', 'name'],
      key: 'name',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.name, b.metadata.name),
      render: value => renderBadgeWithValue('Rule', value),
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
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      sorter: (a, b) => stringSorter(a.action, b.action),
      render: value => renderActionTag(value),
    },
    {
      title: 'Traffic',
      dataIndex: 'traffic',
      key: 'traffic',
      width: 140,
      sorter: (a, b) => stringSorter(a.traffic, b.traffic),
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 140,
      sorter: (a, b) => stringSorter(a.protocol, b.protocol),
    },
    {
      title: 'IP Family',
      dataIndex: 'ipFamily',
      key: 'ipFamily',
      width: 140,
      sorter: (a, b) => stringSorter(a.ipFamily, b.ipFamily),
    },
    {
      title: 'Local',
      dataIndex: 'localEndpoint',
      key: 'localEndpoint',
      width: 220,
      sorter: (a, b) => stringSorter(a.localEndpoint, b.localEndpoint),
    },
    {
      title: 'Remote',
      dataIndex: 'remoteEndpoint',
      key: 'remoteEndpoint',
      width: 220,
      sorter: (a, b) => stringSorter(a.remoteEndpoint, b.remoteEndpoint),
    },
    {
      title: 'Ports / Types',
      key: 'transportEntries',
      width: 240,
      render: (_, record) => {
        const ports = formatTransportSummary('ports', record.spec?.transport?.entries)
        const types = formatTransportSummary('types', record.spec?.transport?.entries)

        if (ports === EMPTY_VALUE && types === EMPTY_VALUE) {
          return EMPTY_VALUE
        }

        return [ports !== EMPTY_VALUE ? `Ports: ${ports}` : '', types !== EMPTY_VALUE ? `Types: ${types}` : '']
          .filter(Boolean)
          .join(' | ')
      },
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
                'aria-label': `Edit ${record.metadata.name || 'rule'}`,
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
                'aria-label': `Delete ${record.metadata.name || 'rule'}`,
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

export const RULES_TABLE_PROPS: Partial<TableProps<TRuleRow>> = {
  pagination: {
    position: ['bottomLeft'],
    showSizeChanger: true,
    hideOnSinglePage: false,
  },
  scroll: { x: 2290 },
  size: 'middle',
}
