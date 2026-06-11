import React, { FC, useMemo, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TAddressGroupResource, TServiceBindingResource, TServiceResource } from 'localTypes'
import { ServiceFormModal } from 'components/organisms/Services/molecules'
import type { TServiceRow } from 'components/organisms/Services/tableConfig'
import { buildNamespacedValue, formatDateTime, renderLinkedResourceBadge, renderTimestampWithIcon } from 'utils'

export type TSgroupsServiceAddressGroupsTabData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsServiceAddressGroupsTabProps = {
  data: TSgroupsServiceAddressGroupsTabData
}

type TServiceAddressGroupRow = {
  key: string
  addressGroupName: string
  addressGroupNamespace: string
  addressGroupDisplayName: string
  created: string
  binding: TServiceBindingResource
}

const isBindingForService = (binding: TServiceBindingResource, serviceName: string, serviceNamespace: string) =>
  binding.spec?.service?.name === serviceName && binding.spec?.service?.namespace === serviceNamespace

const getAddressGroupLookupKey = (addressGroup?: NonNullable<TServiceBindingResource['spec']>['addressGroup']) =>
  buildNamespacedValue(addressGroup)

const mapBindingsToRows = (
  bindings: TServiceBindingResource[],
  addressGroups: TAddressGroupResource[],
): TServiceAddressGroupRow[] => {
  const addressGroupLookup = new Map(
    addressGroups
      .map(addressGroup => [buildNamespacedValue(addressGroup.metadata), addressGroup] as const)
      .filter(([key]) => Boolean(key)),
  )

  return bindings.map(binding => {
    const addressGroupRef = binding.spec?.addressGroup
    const addressGroupKey = getAddressGroupLookupKey(addressGroupRef)
    const addressGroup = addressGroupKey ? addressGroupLookup.get(addressGroupKey) : undefined
    const addressGroupName = addressGroupRef?.name || '-'
    const addressGroupNamespace = addressGroupRef?.namespace || binding.metadata.namespace || '-'

    return {
      binding,
      key: `${binding.metadata.namespace || 'unknown'}-${binding.metadata.name || addressGroupKey || 'unknown'}`,
      addressGroupName,
      addressGroupNamespace,
      addressGroupDisplayName: addressGroup?.spec?.displayName || addressGroupName,
      created: formatDateTime((binding.metadata as { creationTimestamp?: string }).creationTimestamp),
    }
  })
}

const columns: ColumnsType<TServiceAddressGroupRow> = [
  {
    title: 'AddressGroup',
    dataIndex: 'addressGroupDisplayName',
    key: 'addressGroupDisplayName',
    sorter: (a, b) =>
      a.addressGroupDisplayName.localeCompare(b.addressGroupDisplayName, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    render: (value, record) =>
      renderLinkedResourceBadge({
        badgeValue: 'AddressGroup',
        displayValue: value,
        name: record.addressGroupName,
        namespace: record.addressGroupNamespace,
        plural: 'addressgroups',
      }),
  },
  {
    title: 'Created',
    dataIndex: ['binding', 'metadata', 'creationTimestamp'],
    key: 'created',
    width: 280,
    sorter: (a, b) =>
      new Date((a.binding.metadata as { creationTimestamp?: string }).creationTimestamp || 0).getTime() -
      new Date((b.binding.metadata as { creationTimestamp?: string }).creationTimestamp || 0).getTime(),
    render: value => renderTimestampWithIcon(value),
  },
]

export const SgroupsServiceAddressGroupsTab: FC<TSgroupsServiceAddressGroupsTabProps> = ({ data }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useK8sSmartResource<{ items?: TServiceResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'services',
  })
  const {
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{ items?: TServiceBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId),
    namespace: undefined,
    plural: 'servicebindings',
  })
  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items?: TAddressGroupResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId),
    namespace: undefined,
    plural: 'addressgroups',
  })

  const service = serviceData?.items?.[0]
  const filteredBindings = useMemo(
    () => (serviceBindingsData?.items || []).filter(binding => isBindingForService(binding, data.name, data.namespace)),
    [data.name, data.namespace, serviceBindingsData?.items],
  )
  const dataSource = useMemo(
    () => mapBindingsToRows(filteredBindings, addressGroupsData?.items || []),
    [addressGroupsData?.items, filteredBindings],
  )

  if (serviceError || serviceBindingsError || addressGroupsError) {
    return <Alert type="error" title="Error while loading Service AddressGroups" />
  }

  return (
    <>
      <Card styles={{ body: { padding: 16 } }}>
        <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 16 }} wrap="wrap">
          <strong>AddressGroups</strong>
          <Button icon={<PlusOutlined />} disabled={!service} onClick={() => setIsEditModalOpen(true)}>
            Add
          </Button>
        </Flex>
        <Table<TServiceAddressGroupRow>
          columns={columns}
          dataSource={dataSource}
          loading={isServiceLoading || isServiceBindingsLoading || isAddressGroupsLoading}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No AddressGroups found." /> }}
          pagination={{ defaultPageSize: 10, showSizeChanger: false }}
          rowKey="key"
          size="middle"
        />
      </Card>
      {service && isEditModalOpen && (
        <ServiceFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          open={isEditModalOpen}
          service={service as TServiceRow}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  )
}
