import React, { FC, useMemo, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Segmented, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { formatDateTime, renderLinkedResourceBadge, renderTimestampWithIcon } from 'utils'
import { UniRuleFormModal } from 'components/organisms/Rules/molecules'
import type { TRuleEndpoint, TRuleResource } from 'components/organisms/Rules/tableConfig'

export type TSgroupsAddressGroupRulesTabData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsAddressGroupRulesTabProps = {
  data: TSgroupsAddressGroupRulesTabData
}

type TRulesDirection = 'from' | 'to'

type TAddressGroupRuleRow = TRuleResource & {
  key: string
  displayName: string
  created: string
}

const isCurrentAddressGroupEndpoint = (endpoint: TRuleEndpoint | undefined, name: string, namespace: string) =>
  endpoint?.type === 'AddressGroup' && endpoint.name === name && endpoint.namespace === namespace

const mapRulesToRows = (items: TRuleResource[]): TAddressGroupRuleRow[] =>
  items.map(item => ({
    ...item,
    key: `${item.metadata.namespace || 'unknown'}-${item.metadata.name || 'unknown'}`,
    displayName: item.spec?.displayName || item.metadata.name || '-',
    created: formatDateTime(item.metadata.creationTimestamp),
  }))

const columns: ColumnsType<TAddressGroupRuleRow> = [
  {
    title: 'Name',
    dataIndex: 'displayName',
    key: 'displayName',
    sorter: (a, b) => a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: 'base' }),
    render: (value, record) =>
      renderLinkedResourceBadge({
        badgeValue: 'Rule',
        displayValue: value,
        name: record.metadata.name,
        namespace: record.metadata.namespace,
        plural: 'rules',
      }),
  },
  {
    title: 'Created',
    dataIndex: ['metadata', 'creationTimestamp'],
    key: 'created',
    width: 280,
    sorter: (a, b) =>
      new Date(a.metadata.creationTimestamp || 0).getTime() - new Date(b.metadata.creationTimestamp || 0).getTime(),
    render: value => renderTimestampWithIcon(value),
  },
]

export const SgroupsAddressGroupRulesTab: FC<TSgroupsAddressGroupRulesTabProps> = ({ data }) => {
  const [direction, setDirection] = useState<TRulesDirection>('from')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const {
    data: rulesData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items?: TRuleResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: undefined,
    plural: 'rules',
  })

  const filteredRules = useMemo(
    () =>
      (rulesData?.items || []).filter(rule => {
        const endpoints = rule.spec?.endpoints
        const endpoint = direction === 'from' ? endpoints?.local : endpoints?.remote

        return isCurrentAddressGroupEndpoint(endpoint, data.name, data.namespace)
      }),
    [data.name, data.namespace, direction, rulesData?.items],
  )
  const dataSource = useMemo(() => mapRulesToRows(filteredRules), [filteredRules])

  if (error) {
    return <Alert type="error" message="Error while loading AddressGroup rules" />
  }

  return (
    <>
      <Card styles={{ body: { padding: 16 } }}>
        <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 16 }} wrap="wrap">
          <Segmented
            options={[
              { label: 'Rules from', value: 'from' },
              { label: 'Rules to', value: 'to' },
            ]}
            value={direction}
            onChange={value => setDirection(value as TRulesDirection)}
          />
          <Button icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Add
          </Button>
        </Flex>
        <Table<TAddressGroupRuleRow>
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rules found." /> }}
          pagination={{ defaultPageSize: 10, showSizeChanger: false }}
          rowKey="key"
          size="middle"
        />
      </Card>
      {isCreateModalOpen && (
        <UniRuleFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </>
  )
}
