/* eslint-disable react/no-array-index-key */
import React from 'react'
import { Button, Space, TableProps, Tag, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import {
  formatDateTime,
  formatTrafficValue,
  renderBadgeWithValue,
  renderNamespacedResourceValue,
  renderNamespaceBadgeWithValue,
  renderTimestampWithIcon,
} from 'utils'

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
  traffic?: 'Both' | 'Ingress' | 'Egress'
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

export type TEndpointDisplayLookup = Record<string, string>

type TBuildRulesColumnsParams = {
  onEdit?: (record: TRuleRow) => void
  onDelete?: (record: TRuleRow) => void
  endpointDisplayLookup?: TEndpointDisplayLookup
}

const EMPTY_VALUE = '-'

export const getEndpointLookupKey = (endpoint?: TRuleEndpoint) => {
  if (!endpoint?.namespace || !endpoint.name) {
    return undefined
  }

  return `${endpoint.namespace}/${endpoint.name}`
}

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

const renderActionTag = (value?: string) => {
  if (!value || value === EMPTY_VALUE) {
    return EMPTY_VALUE
  }

  return React.createElement(Tag, { color: value === 'Allow' ? 'green' : 'red' }, value)
}

const renderValueTag = (value?: string) => {
  if (!value || value === EMPTY_VALUE) {
    return EMPTY_VALUE
  }

  return React.createElement(Tag, null, value)
}

const getEndpointDisplayName = (endpoint?: TRuleEndpoint, endpointDisplayLookup: TEndpointDisplayLookup = {}) => {
  const lookupKey = getEndpointLookupKey(endpoint)

  return (lookupKey && endpointDisplayLookup[lookupKey]) || endpoint?.name || endpoint?.value
}

const formatEndpointLabel = (endpoint?: TRuleEndpoint, endpointDisplayLookup: TEndpointDisplayLookup = {}): string => {
  if (!endpoint) {
    return EMPTY_VALUE
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    return endpoint.value || EMPTY_VALUE
  }

  const name = getEndpointDisplayName(endpoint, endpointDisplayLookup)

  if (!name) {
    return EMPTY_VALUE
  }

  return endpoint.namespace ? `${name} (${endpoint.namespace})` : name
}

export const renderEndpointLabel = (endpoint?: TRuleEndpoint, endpointDisplayLookup: TEndpointDisplayLookup = {}) => {
  if (!endpoint) {
    return EMPTY_VALUE
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    return endpoint.value || EMPTY_VALUE
  }

  const name = getEndpointDisplayName(endpoint, endpointDisplayLookup)

  if (!name) {
    return EMPTY_VALUE
  }

  return renderNamespacedResourceValue(endpoint.type || 'Endpoint', endpoint.namespace, name)
}

const formatTransportEntryText = (entry: TRuleTransportEntry, index: number) => {
  const parts = []

  if (entry.ports) {
    parts.push(`Ports: ${entry.ports}`)
  }

  if (entry.types && entry.types.length > 0) {
    parts.push(`Types: ${entry.types.join(', ')}`)
  }

  return parts.join(' | ') || `Entry ${index + 1}`
}

const renderTransportEntryTooltip = (entry: TRuleTransportEntry) => {
  const details = []

  if (entry.description) {
    details.push(['Description', entry.description])
  }

  if (entry.comment) {
    details.push(['Comment', entry.comment])
  }

  if (details.length === 0) {
    return undefined
  }

  return React.createElement(
    React.Fragment,
    null,
    ...details.map(([label, value]) =>
      React.createElement(
        'div',
        { key: label },
        React.createElement(Typography.Text, { strong: true }, `${label}:`),
        ` ${value}`,
      ),
    ),
  )
}

const renderTransportEntries = (entries?: TRuleTransportEntry[]) => {
  if (!entries || entries.length === 0) {
    return EMPTY_VALUE
  }

  return React.createElement(
    Space,
    { direction: 'vertical', size: 4 },
    ...entries.map((entry, index) => {
      const text = formatTransportEntryText(entry, index)
      const tooltip = renderTransportEntryTooltip(entry)
      const tag = React.createElement(Tag, { key: `${text}-${index}` }, text)

      return tooltip ? React.createElement(Tooltip, { key: `${text}-${index}`, title: tooltip }, tag) : tag
    }),
  )
}

export const mapRulesToRows = (
  items: TRuleResource[],
  endpointDisplayLookup: TEndpointDisplayLookup = {},
): TRuleRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
    displayName: item.spec?.displayName || item.metadata.name || EMPTY_VALUE,
    action: item.spec?.action || EMPTY_VALUE,
    traffic: formatTrafficValue(item.spec?.session?.traffic),
    protocol: item.spec?.transport?.protocol || EMPTY_VALUE,
    ipFamily: item.spec?.transport?.IPv || EMPTY_VALUE,
    localEndpoint: formatEndpointLabel(item.spec?.endpoints?.local, endpointDisplayLookup),
    remoteEndpoint: formatEndpointLabel(item.spec?.endpoints?.remote, endpointDisplayLookup),
    description: item.spec?.description || EMPTY_VALUE,
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

export const buildRulesColumns = ({
  onDelete,
  onEdit,
  endpointDisplayLookup = {},
}: TBuildRulesColumnsParams = {}): ColumnsType<TRuleRow> => {
  const columns: ColumnsType<TRuleRow> = [
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => stringSorter(a.displayName, b.displayName),
      render: value => renderBadgeWithValue('Rule', value),
    },
    {
      title: 'Namespace',
      dataIndex: ['metadata', 'namespace'],
      key: 'namespace',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.namespace, b.metadata.namespace),
      render: value => renderNamespaceBadgeWithValue(value),
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
      render: value => renderValueTag(value),
    },
    {
      title: 'IP Family',
      dataIndex: 'ipFamily',
      key: 'ipFamily',
      width: 140,
      sorter: (a, b) => stringSorter(a.ipFamily, b.ipFamily),
      render: value => renderValueTag(value),
    },
    {
      title: 'Local',
      dataIndex: 'localEndpoint',
      key: 'localEndpoint',
      width: 360,
      sorter: (a, b) => stringSorter(a.localEndpoint, b.localEndpoint),
      render: (_, record) => renderEndpointLabel(record.spec?.endpoints?.local, endpointDisplayLookup),
    },
    {
      title: 'Remote',
      dataIndex: 'remoteEndpoint',
      key: 'remoteEndpoint',
      width: 360,
      sorter: (a, b) => stringSorter(a.remoteEndpoint, b.remoteEndpoint),
      render: (_, record) => renderEndpointLabel(record.spec?.endpoints?.remote, endpointDisplayLookup),
    },
    {
      title: 'Ports / Types',
      key: 'transportEntries',
      width: 240,
      render: (_, record) => renderTransportEntries(record.spec?.transport?.entries),
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
      width: 240,
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
                'aria-label': `Edit ${record.displayName || 'rule'}`,
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
                'aria-label': `Delete ${record.displayName || 'rule'}`,
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
  pagination: false,
  scroll: { x: 2710 },
  size: 'middle',
}
