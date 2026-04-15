import { TableProps } from 'antd'
import { AnyObject } from 'antd/es/_util/type'
import {
  TAdditionalPrinterColumns,
  TAdditionalPrinterColumnsTrimLengths,
  TAdditionalPrinterColumnsUndefinedValues,
  TSingleResource,
} from '@prorobotech/openapi-k8s-toolkit'

type TAdditionalPrinterColumnsKeyTypeProps = Record<
  string,
  {
    type: string
    customProps?: unknown
  }
>

type TAdditionalPrinterColumnsCustomSortersAndFilters = {
  key: string
  type: string
}[]

export const HOSTS_ADDITIONAL_PRINTER_COLUMNS: TAdditionalPrinterColumns = [
  {
    name: 'Name',
    type: 'string',
    jsonPath: '.metadata.name',
  },
  {
    name: 'Namespace',
    type: 'string',
    jsonPath: '.metadata.namespace',
  },
  {
    name: 'Display Name',
    type: 'string',
    jsonPath: '.spec.displayName',
  },
  {
    name: 'Host Name',
    type: 'string',
    jsonPath: '.metaInfo.hostName',
  },
  {
    name: 'OS',
    type: 'string',
    jsonPath: '.metaInfo.os',
  },
  {
    name: 'Platform',
    type: 'string',
    jsonPath: '.metaInfo.platform',
  },
  {
    name: 'Platform Version',
    type: 'string',
    jsonPath: '.metaInfo.platformVersion',
  },
  {
    name: 'Kernel Version',
    type: 'string',
    jsonPath: '.metaInfo.kernelVersion',
  },
  {
    name: 'IPv4',
    type: 'array',
    jsonPath: '.ips.IPv4',
  },
  {
    name: 'IPv6',
    type: 'array',
    jsonPath: '.ips.IPv6',
  },
  {
    name: 'Description',
    type: 'string',
    jsonPath: '.spec.description',
  },
  {
    name: 'Comment',
    type: 'string',
    jsonPath: '.spec.comment',
  },
  {
    name: 'Created',
    type: 'factory',
    jsonPath: '.metadata.creationTimestamp',
  },
]

export const HOSTS_UNDEFINED_VALUES: TAdditionalPrinterColumnsUndefinedValues = [
  { key: 'Namespace', value: '-' },
  { key: 'Display Name', value: '-' },
  { key: 'Description', value: '-' },
  { key: 'Comment', value: '-' },
]

export const HOSTS_TRIM_LENGTHS: TAdditionalPrinterColumnsTrimLengths = [
  { key: 'Name', value: 64 },
  { key: 'Display Name', value: 64 },
  { key: 'Description', value: 96 },
  { key: 'Comment', value: 96 },
]

export const HOSTS_SORTERS_AND_FILTERS: TAdditionalPrinterColumnsCustomSortersAndFilters = [
  { key: 'Created', type: 'disabled' },
]

export const HOSTS_KEY_TYPE_PROPS: TAdditionalPrinterColumnsKeyTypeProps = {
  Name: {
    type: 'factory',
    customProps: {
      disableEventBubbling: true,
      items: [
        {
          type: 'antdFlex',
          data: {
            align: 'center',
            direction: 'row',
            gap: 6,
            id: 'resource-badge-name-row',
          },
          children: [
            {
              type: 'ResourceBadge',
              data: {
                id: 'host-resource-badge',
                value: 'Host',
              },
            },
            {
              type: 'parsedText',
              data: {
                id: 'host-name-text',
                text: "{reqsJsonPath[0]['.metadata.name']['-']}",
              },
            },
          ],
        },
      ],
    },
  },
  Namespace: {
    type: 'factory',
    customProps: {
      disableEventBubbling: true,
      items: [
        {
          type: 'antdFlex',
          data: {
            align: 'center',
            direction: 'row',
            gap: 6,
            id: 'resource-badge-name-row',
          },
          children: [
            {
              type: 'ResourceBadge',
              data: {
                id: 'host-resource-badge',
                value: 'Namespace',
              },
            },
            {
              type: 'parsedText',
              data: {
                id: 'host-name-text',
                text: "{reqsJsonPath[0]['.metadata.namespace']['-']}",
              },
            },
          ],
        },
      ],
    },
  },
  Created: {
    type: 'factory',
    customProps: {
      disableEventBubbling: true,
      items: [
        {
          type: 'antdFlex',
          data: {
            align: 'center',
            gap: 6,
            id: 'time-block',
          },
          children: [
            {
              type: 'antdText',
              data: {
                id: 'time-icon',
                text: '🌐',
              },
            },
            {
              type: 'parsedText',
              data: {
                id: 'created-timestamp',
                text: "{reqsJsonPath[0]['.metadata.creationTimestamp']['-']}",
                formatter: 'timestamp',
              },
            },
          ],
        },
      ],
    },
  },
}

const getColumnDataIndex = (jsonPath?: string): string | string[] | undefined => {
  if (!jsonPath) {
    return undefined
  }

  if (jsonPath.startsWith('.')) {
    const parts = jsonPath.split('.').slice(1)

    if (parts.length === 1) {
      return parts[0]
    }

    return parts
  }

  return jsonPath
}

export const buildHostsColumns = (): TableProps<AnyObject>['columns'] =>
  HOSTS_ADDITIONAL_PRINTER_COLUMNS.map(({ name, jsonPath }) => ({
    title: name,
    key: name,
    dataIndex: getColumnDataIndex(jsonPath),
  }))

export const buildHostsDataSource = (items: TSingleResource[]): TableProps<AnyObject>['dataSource'] =>
  items.map(item => ({
    key: `${item.metadata.name}${item.metadata.namespace ? `-${item.metadata.namespace}` : ''}`,
    ...item,
  }))
