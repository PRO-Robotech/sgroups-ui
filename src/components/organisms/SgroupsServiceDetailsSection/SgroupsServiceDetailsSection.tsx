import React, { FC, ReactNode, useMemo } from 'react'
import { Alert, Card, Empty, Flex, Spin, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TServiceResource } from 'localTypes'

export type TSgroupsServiceDetailsSectionData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsServiceDetailsSectionProps = {
  data: TSgroupsServiceDetailsSectionData
}

type TServiceDetailsResource = TServiceResource & {
  metadata: TServiceResource['metadata'] & {
    uid?: string
  }
}

const EMPTY_VALUE = '-'

const fieldLabelStyle: React.CSSProperties = {
  flex: '0 0 140px',
  lineHeight: '22px',
}

const fieldValueStyle: React.CSSProperties = {
  lineHeight: '22px',
  minWidth: 0,
}

const sectionTitleStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '24px',
  paddingBottom: 16,
}

const cardStyles = {
  body: { padding: 24 },
}

const renderValue = (value?: string) => value || EMPTY_VALUE

const DetailField: FC<{ label: string; children: ReactNode; align?: 'center' | 'flex-start' }> = ({
  label,
  children,
  align = 'center',
}) => (
  <Flex align={align} gap={8} style={{ width: '100%' }}>
    <Typography.Text style={fieldLabelStyle} type="secondary">
      {label}
    </Typography.Text>
    <div style={fieldValueStyle}>{children}</div>
  </Flex>
)

type TIncomingPortRow = {
  key: string
  port: string
  protocol: string
  description: string
}

const buildIncomingPortRows = (service: TServiceDetailsResource): TIncomingPortRow[] =>
  (service.spec?.transports || []).flatMap((transport, transportIndex) =>
    (transport.entries || []).map((entry, entryIndex) => ({
      key: `${transportIndex}-${entryIndex}`,
      port: entry.ports || (entry.types?.length ? entry.types.join(', ') : EMPTY_VALUE),
      protocol: transport.protocol || EMPTY_VALUE,
      description: entry.description || EMPTY_VALUE,
    })),
  )

const incomingPortsColumns: ColumnsType<TIncomingPortRow> = [
  {
    title: 'Port',
    dataIndex: 'port',
    key: 'port',
    width: 120,
    sorter: (a, b) => a.port.localeCompare(b.port, undefined, { numeric: true, sensitivity: 'base' }),
  },
  {
    title: 'Protocol',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 120,
    sorter: (a, b) => a.protocol.localeCompare(b.protocol, undefined, { numeric: true, sensitivity: 'base' }),
    render: value => (value === EMPTY_VALUE ? value : <Tag>{value}</Tag>),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    sorter: (a, b) => a.description.localeCompare(b.description, undefined, { numeric: true, sensitivity: 'base' }),
  },
]

export const SgroupsServiceDetailsSection: FC<TSgroupsServiceDetailsSectionProps> = ({ data }) => {
  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useK8sSmartResource<{ items?: TServiceDetailsResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'services',
  })
  const service = serviceData?.items?.[0]
  const incomingPortRows = useMemo(() => (service ? buildIncomingPortRows(service) : []), [service])

  if (isServiceLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    )
  }

  if (serviceError) {
    return <Alert type="error" message="Error while loading Service details" />
  }

  if (!service) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Service was not found." />
  }

  return (
    <Flex gap={8} wrap="wrap">
      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
        <Flex gap={24} vertical>
          <DetailField label="Description" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(service.spec?.description)}</Typography.Paragraph>
          </DetailField>

          <DetailField label="Comment" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(service.spec?.comment)}</Typography.Paragraph>
          </DetailField>
        </Flex>
      </Card>

      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Incoming ports</Typography.Text>
        <Table<TIncomingPortRow>
          columns={incomingPortsColumns}
          dataSource={incomingPortRows}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No incoming ports" /> }}
          pagination={false}
          rowKey="key"
          size="middle"
        />
      </Card>
    </Flex>
  )
}
