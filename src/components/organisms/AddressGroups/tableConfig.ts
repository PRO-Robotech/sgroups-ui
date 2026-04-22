import { Button, TableProps, Tag, Tooltip } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import React from 'react'
import { formatBooleanFlag, formatDateTime, renderBadgeWithValue, renderTimestampWithIcon } from 'utils'

export type TAddressGroupRef = {
  kind?: string
  resType?: string
  name?: string
  namespace?: string
}

export type TAddressGroupResource = {
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
    defaultAction?: 'Allow' | 'Deny'
    logs?: boolean
    trace?: boolean
  }
  refs?: TAddressGroupRef[]
}

export type TAddressGroupRow = TAddressGroupResource & {
  key: string
  displayName: string
  defaultAction: string
  logsLabel: string
  traceLabel: string
  description: string
  created: string
}

const EMPTY_VALUE = '-'

const stringSorter = (first?: string, second?: string): number =>
  (first || '').localeCompare(second || '', undefined, { numeric: true, sensitivity: 'base' })

const booleanSorter = (first?: boolean, second?: boolean): number => {
  const rank = (value?: boolean) => {
    if (value === true) {
      return 2
    }

    if (value === false) {
      return 1
    }

    return 0
  }

  return rank(first) - rank(second)
}

const renderDefaultActionTag = (value?: string) => {
  if (!value || value === EMPTY_VALUE) {
    return EMPTY_VALUE
  }

  const color = value === 'Allow' ? 'green' : 'red'

  return React.createElement(Tag, { color }, value)
}

type TBuildAddressGroupsColumnsParams = {
  onEdit?: (record: TAddressGroupRow) => void
}

export const mapAddressGroupsToRows = (items: TAddressGroupResource[]): TAddressGroupRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.name || 'unknown'}-${item.metadata.namespace || 'all'}`,
    displayName: item.spec?.displayName || EMPTY_VALUE,
    defaultAction: item.spec?.defaultAction || EMPTY_VALUE,
    logsLabel: formatBooleanFlag(item.spec?.logs),
    traceLabel: formatBooleanFlag(item.spec?.trace),
    description: item.spec?.description || EMPTY_VALUE,
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

export const buildAddressGroupsColumns = ({
  onEdit,
}: TBuildAddressGroupsColumnsParams = {}): ColumnsType<TAddressGroupRow> => {
  const columns: ColumnsType<TAddressGroupRow> = [
    {
      title: 'Name',
      dataIndex: ['metadata', 'name'],
      key: 'name',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => stringSorter(a.metadata.name, b.metadata.name),
      render: value => renderBadgeWithValue('Address Group', value),
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
      title: 'Default Action',
      dataIndex: 'defaultAction',
      key: 'defaultAction',
      width: 160,
      sorter: (a, b) => stringSorter(a.defaultAction, b.defaultAction),
      render: value => renderDefaultActionTag(value),
    },
    {
      title: 'Logs',
      dataIndex: 'logsLabel',
      key: 'logs',
      width: 140,
      sorter: (a, b) => booleanSorter(a.spec?.logs, b.spec?.logs),
    },
    {
      title: 'Trace',
      dataIndex: 'traceLabel',
      key: 'trace',
      width: 140,
      sorter: (a, b) => booleanSorter(a.spec?.trace, b.spec?.trace),
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

export const ADDRESS_GROUPS_TABLE_PROPS: Partial<TableProps<TAddressGroupRow>> = {
  pagination: {
    position: ['bottomLeft'],
    showSizeChanger: true,
    hideOnSinglePage: false,
  },
  scroll: { x: 1700 },
  size: 'middle',
}
