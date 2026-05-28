/* eslint-disable no-nested-ternary */
import React, { FC, useMemo, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { AddressGroupFormModal } from 'components/organisms/AddressGroups/molecules'
import { buildNamespacedValue, formatDateTime, renderLinkedResourceBadge, renderTimestampWithIcon } from 'utils'

export type TAddressGroupEntityTabKind = 'hosts' | 'networks' | 'services'

export type TSgroupsAddressGroupEntitiesTabData = {
  clusterId: string
  namespace: string
  name: string
  kind: TAddressGroupEntityTabKind
}

type TSgroupsAddressGroupEntitiesTabProps = {
  data: TSgroupsAddressGroupEntitiesTabData
}

type TAddressGroupEntityRow = {
  key: string
  resourceName: string
  resourceNamespace: string
  resourceDisplayName: string
  resourceKind: 'Host' | 'Network' | 'Service'
  primaryInfo: string[]
  primaryInfoLabel: string
  created?: string
  binding: THostBindingResource | TNetworkBindingResource | TServiceBindingResource
}

const EMPTY_VALUE = '-'

const ENTITY_CONFIG = {
  hosts: {
    bindingPlural: 'hostbindings',
    emptyDescription: 'No Hosts found.',
    resourceBadge: 'Host',
    resourcePlural: 'hosts',
    title: 'Hosts',
  },
  networks: {
    bindingPlural: 'networkbindings',
    emptyDescription: 'No Networks found.',
    resourceBadge: 'Network',
    resourcePlural: 'networks',
    title: 'Networks',
  },
  services: {
    bindingPlural: 'servicebindings',
    emptyDescription: 'No Services found.',
    resourceBadge: 'Service',
    resourcePlural: 'services',
    title: 'Services',
  },
} as const

const getAddressGroupNamespace = (
  binding: THostBindingResource | TNetworkBindingResource | TServiceBindingResource,
  allowBindingNamespaceFallback: boolean,
) => binding.spec?.addressGroup?.namespace || (allowBindingNamespaceFallback ? binding.metadata.namespace : undefined)

const isBindingForAddressGroup = (
  binding: THostBindingResource | TNetworkBindingResource | TServiceBindingResource,
  addressGroupName: string,
  addressGroupNamespace: string,
  allowBindingNamespaceFallback: boolean,
) =>
  binding.spec?.addressGroup?.name === addressGroupName &&
  getAddressGroupNamespace(binding, allowBindingNamespaceFallback) === addressGroupNamespace

const makeLookup = <TResource extends { metadata: { name?: string; namespace?: string } }>(resources: TResource[]) =>
  new Map(
    resources
      .map(resource => [buildNamespacedValue(resource.metadata), resource] as const)
      .filter(([key]) => Boolean(key)),
  )

const renderInfoValues = (values: string[]) => {
  if (values.length === 0) {
    return EMPTY_VALUE
  }

  return (
    <Space direction="vertical" size={4}>
      {values.map(value => (
        <Tag key={value}>{value}</Tag>
      ))}
    </Space>
  )
}

const getHostIps = (host?: THostResource) => {
  const ips = host?.ips || host?.spec?.IPs

  return [...(ips?.IPv4 || []), ...(ips?.IPv6 || [])]
}

const getServiceTransportInfo = (service?: TServiceResource) =>
  (service?.spec?.transports || []).flatMap(transport =>
    (transport.entries || []).map(entry => {
      const parts = []

      if (transport.protocol) {
        parts.push(transport.protocol)
      }

      if (transport.IPv) {
        parts.push(transport.IPv)
      }

      if (entry.ports) {
        parts.push(entry.ports)
      }

      if (entry.types?.length) {
        parts.push(`Types: ${entry.types.join(', ')}`)
      }

      return parts.join(' / ')
    }),
  )

const mapHostBindingsToRows = (bindings: THostBindingResource[], hosts: THostResource[]): TAddressGroupEntityRow[] => {
  const hostsByKey = makeLookup(hosts)

  return bindings.map(binding => {
    const hostRef = binding.spec?.host
    const resourceNamespace = hostRef?.namespace || binding.metadata.namespace || EMPTY_VALUE
    const resourceName = hostRef?.name || EMPTY_VALUE
    const host = hostsByKey.get(buildNamespacedValue({ namespace: resourceNamespace, name: resourceName }))

    return {
      binding,
      key: `${binding.metadata.namespace || 'unknown'}-${binding.metadata.name || resourceName}`,
      resourceKind: 'Host',
      resourceName,
      resourceNamespace,
      resourceDisplayName: host?.spec?.displayName || resourceName,
      primaryInfo: getHostIps(host),
      primaryInfoLabel: 'IPs',
      created: formatDateTime((binding.metadata as { creationTimestamp?: string }).creationTimestamp),
    }
  })
}

const mapNetworkBindingsToRows = (
  bindings: TNetworkBindingResource[],
  networks: TNetworkResource[],
): TAddressGroupEntityRow[] => {
  const networksByKey = makeLookup(networks)

  return bindings.map(binding => {
    const networkRef = binding.spec?.network
    const resourceNamespace = networkRef?.namespace || binding.metadata.namespace || EMPTY_VALUE
    const resourceName = networkRef?.name || EMPTY_VALUE
    const network = networksByKey.get(buildNamespacedValue({ namespace: resourceNamespace, name: resourceName }))

    return {
      binding,
      key: `${binding.metadata.namespace || 'unknown'}-${binding.metadata.name || resourceName}`,
      resourceKind: 'Network',
      resourceName,
      resourceNamespace,
      resourceDisplayName: network?.spec?.displayName || resourceName,
      primaryInfo: network?.spec?.CIDR ? [network.spec.CIDR] : [],
      primaryInfoLabel: 'CIDR',
      created: formatDateTime((binding.metadata as { creationTimestamp?: string }).creationTimestamp),
    }
  })
}

const mapServiceBindingsToRows = (
  bindings: TServiceBindingResource[],
  services: TServiceResource[],
): TAddressGroupEntityRow[] => {
  const servicesByKey = makeLookup(services)

  return bindings.map(binding => {
    const serviceRef = binding.spec?.service
    const resourceNamespace = serviceRef?.namespace || binding.metadata.namespace || EMPTY_VALUE
    const resourceName = serviceRef?.name || EMPTY_VALUE
    const service = servicesByKey.get(buildNamespacedValue({ namespace: resourceNamespace, name: resourceName }))

    return {
      binding,
      key: `${binding.metadata.namespace || 'unknown'}-${binding.metadata.name || resourceName}`,
      resourceKind: 'Service',
      resourceName,
      resourceNamespace,
      resourceDisplayName: service?.spec?.displayName || resourceName,
      primaryInfo: getServiceTransportInfo(service),
      primaryInfoLabel: 'Transports',
      created: formatDateTime((binding.metadata as { creationTimestamp?: string }).creationTimestamp),
    }
  })
}

const buildColumns = (kind: TAddressGroupEntityTabKind): ColumnsType<TAddressGroupEntityRow> => {
  const config = ENTITY_CONFIG[kind]

  return [
    {
      title: config.resourceBadge,
      dataIndex: 'resourceDisplayName',
      key: 'resourceDisplayName',
      width: 260,
      sorter: (a, b) => a.resourceDisplayName.localeCompare(b.resourceDisplayName, undefined, { numeric: true }),
      render: (value, record) =>
        renderLinkedResourceBadge({
          badgeValue: record.resourceKind,
          displayValue: value,
          name: record.resourceName,
          namespace: record.resourceNamespace,
          plural: config.resourcePlural,
        }),
    },
    {
      title: kind === 'services' ? 'Transports' : kind === 'hosts' ? 'IPs' : 'CIDR',
      dataIndex: 'primaryInfo',
      key: 'primaryInfo',
      render: values => renderInfoValues(values),
    },
    {
      title: 'Created',
      dataIndex: ['binding', 'metadata', 'creationTimestamp'],
      key: 'created',
      width: 240,
      sorter: (a, b) =>
        new Date((a.binding.metadata as { creationTimestamp?: string }).creationTimestamp || 0).getTime() -
        new Date((b.binding.metadata as { creationTimestamp?: string }).creationTimestamp || 0).getTime(),
      render: value => renderTimestampWithIcon(value),
    },
  ]
}

export const SgroupsAddressGroupEntitiesTab: FC<TSgroupsAddressGroupEntitiesTabProps> = ({ data }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const config = ENTITY_CONFIG[data.kind]
  const {
    data: addressGroupData,
    isLoading: isAddressGroupLoading,
    error: addressGroupError,
  } = useK8sSmartResource<{ items?: TAddressGroupResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'addressgroups',
  })
  const {
    data: hostBindingsData,
    isLoading: isHostBindingsLoading,
    error: hostBindingsError,
  } = useK8sSmartResource<{ items?: THostBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: data.kind === 'hosts' && Boolean(data.clusterId && data.namespace),
    namespace: data.namespace,
    plural: 'hostbindings',
  })
  const {
    data: networkBindingsData,
    isLoading: isNetworkBindingsLoading,
    error: networkBindingsError,
  } = useK8sSmartResource<{ items?: TNetworkBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: data.kind === 'networks' && Boolean(data.clusterId && data.namespace),
    namespace: data.namespace,
    plural: 'networkbindings',
  })
  const {
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{ items?: TServiceBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: data.kind === 'services' && Boolean(data.clusterId),
    namespace: undefined,
    plural: 'servicebindings',
  })
  const {
    data: hostsData,
    isLoading: isHostsLoading,
    error: hostsError,
  } = useK8sSmartResource<{ items?: THostResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: data.kind === 'hosts' && Boolean(data.clusterId && data.namespace),
    namespace: data.namespace,
    plural: 'hosts',
  })
  const {
    data: networksData,
    isLoading: isNetworksLoading,
    error: networksError,
  } = useK8sSmartResource<{ items?: TNetworkResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: data.kind === 'networks' && Boolean(data.clusterId && data.namespace),
    namespace: data.namespace,
    plural: 'networks',
  })
  const {
    data: servicesData,
    isLoading: isServicesLoading,
    error: servicesError,
  } = useK8sSmartResource<{ items?: TServiceResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: data.kind === 'services' && Boolean(data.clusterId),
    namespace: undefined,
    plural: 'services',
  })

  const addressGroup = addressGroupData?.items?.[0]
  const dataSource = useMemo(() => {
    if (data.kind === 'hosts') {
      const bindings = (hostBindingsData?.items || []).filter(binding =>
        isBindingForAddressGroup(binding, data.name, data.namespace, true),
      )

      return mapHostBindingsToRows(bindings, hostsData?.items || [])
    }

    if (data.kind === 'networks') {
      const bindings = (networkBindingsData?.items || []).filter(binding =>
        isBindingForAddressGroup(binding, data.name, data.namespace, true),
      )

      return mapNetworkBindingsToRows(bindings, networksData?.items || [])
    }

    const bindings = (serviceBindingsData?.items || []).filter(binding =>
      isBindingForAddressGroup(binding, data.name, data.namespace, false),
    )

    return mapServiceBindingsToRows(bindings, servicesData?.items || [])
  }, [
    data.kind,
    data.name,
    data.namespace,
    hostBindingsData?.items,
    hostsData?.items,
    networkBindingsData?.items,
    networksData?.items,
    serviceBindingsData?.items,
    servicesData?.items,
  ])
  const columns = useMemo(() => buildColumns(data.kind), [data.kind])
  const isLoading =
    isAddressGroupLoading ||
    isHostBindingsLoading ||
    isNetworkBindingsLoading ||
    isServiceBindingsLoading ||
    isHostsLoading ||
    isNetworksLoading ||
    isServicesLoading
  const hasError =
    addressGroupError ||
    hostBindingsError ||
    networkBindingsError ||
    serviceBindingsError ||
    hostsError ||
    networksError ||
    servicesError

  if (hasError) {
    return <Alert type="error" message={`Error while loading AddressGroup ${config.title}`} />
  }

  return (
    <>
      <Card styles={{ body: { padding: 16 } }}>
        <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 16 }} wrap="wrap">
          <Typography.Text strong>{config.title}</Typography.Text>
          <Button icon={<PlusOutlined />} disabled={!addressGroup} onClick={() => setIsEditModalOpen(true)}>
            Add
          </Button>
        </Flex>
        <Table<TAddressGroupEntityRow>
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={config.emptyDescription} /> }}
          pagination={{ defaultPageSize: 10, showSizeChanger: false }}
          rowKey="key"
          scroll={{ x: 960 }}
          size="middle"
        />
      </Card>
      {addressGroup && isEditModalOpen && (
        <AddressGroupFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          addressGroup={addressGroup}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  )
}
