import React, { FC, ReactNode, useMemo, useState } from 'react'
import { CaretDownOutlined } from '@ant-design/icons'
import { Alert, Card, Empty, Flex, Spin, Switch, Tree, Typography, message } from 'antd'
import { patchEntryWithReplaceOp, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { useQueryClient } from '@tanstack/react-query'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { getApiEndpoint, renderBooleanStatusIcon } from 'utils'
import { TreeContainer } from 'components/atoms'
import { buildAddressGroupContentsTree } from 'components/organisms/AddressGroups/molecules/VerboseAddressGroupPanel/contentsTree'

export type TSgroupsAddressGroupDetailsSectionData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsAddressGroupDetailsSectionProps = {
  data: TSgroupsAddressGroupDetailsSectionData
}

type TAddressGroupDetailsResource = TAddressGroupResource

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

const DetailField: FC<{
  label: string
  children: ReactNode
  align?: 'center' | 'flex-start'
}> = ({ label, children, align = 'center' }) => (
  <Flex align={align} gap={8} style={{ width: '100%' }}>
    <Typography.Text style={fieldLabelStyle} type="secondary">
      {label}
    </Typography.Text>
    <div style={fieldValueStyle}>{children}</div>
  </Flex>
)

export const SgroupsAddressGroupDetailsSection: FC<TSgroupsAddressGroupDetailsSectionProps> = ({ data }) => {
  const queryClient = useQueryClient()
  const [isDefaultActionSubmitting, setIsDefaultActionSubmitting] = useState(false)
  const {
    data: addressGroupData,
    isLoading: isAddressGroupLoading,
    error: addressGroupError,
  } = useK8sSmartResource<{ items?: TAddressGroupDetailsResource[] }>({
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
    isEnabled: Boolean(data.clusterId && data.namespace),
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
    isEnabled: Boolean(data.clusterId && data.namespace),
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
    isEnabled: Boolean(data.clusterId),
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
    isEnabled: Boolean(data.clusterId && data.namespace),
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
    isEnabled: Boolean(data.clusterId && data.namespace),
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
    isEnabled: Boolean(data.clusterId),
    namespace: undefined,
    plural: 'services',
  })

  const addressGroup = addressGroupData?.items?.[0]
  const entitiesTreeData = useMemo(
    () =>
      buildAddressGroupContentsTree({
        addressGroupName: data.name,
        addressGroupNamespace: data.namespace,
        hostBindings: hostBindingsData?.items || [],
        hosts: hostsData?.items || [],
        networkBindings: networkBindingsData?.items || [],
        networks: networksData?.items || [],
        serviceBindings: serviceBindingsData?.items || [],
        services: servicesData?.items || [],
        hostBindingsError: Boolean(hostBindingsError),
        networkBindingsError: Boolean(networkBindingsError),
        serviceBindingsError: Boolean(serviceBindingsError),
        hostsError: Boolean(hostsError),
        networksError: Boolean(networksError),
        servicesError: Boolean(servicesError),
      }),
    [
      data.name,
      data.namespace,
      hostBindingsData?.items,
      hostsData?.items,
      networkBindingsData?.items,
      networksData?.items,
      serviceBindingsData?.items,
      servicesData?.items,
      hostBindingsError,
      networkBindingsError,
      serviceBindingsError,
      hostsError,
      networksError,
      servicesError,
    ],
  )
  const endpoint =
    addressGroup?.metadata.name && addressGroup.metadata.namespace
      ? `${getApiEndpoint(data.clusterId, addressGroup.metadata.namespace, 'addressgroups')}/${
          addressGroup.metadata.name
        }`
      : ''
  const handleDefaultActionChange = async (allowAccess: boolean) => {
    if (!endpoint) {
      return
    }

    const nextDefaultAction = allowAccess ? 'Allow' : 'Deny'
    const currentDefaultAction = addressGroup?.spec?.defaultAction || 'Deny'

    if (nextDefaultAction === currentDefaultAction) {
      return
    }

    setIsDefaultActionSubmitting(true)

    try {
      await patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/defaultAction',
        body: nextDefaultAction,
      })
      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      await queryClient.invalidateQueries({ queryKey: ['multi'] })
      message.success('Default action has been updated')
    } catch (error) {
      message.error(`Failed to update default action: ${String(error)}`)
    } finally {
      setIsDefaultActionSubmitting(false)
    }
  }

  if (
    isAddressGroupLoading ||
    isHostBindingsLoading ||
    isNetworkBindingsLoading ||
    isServiceBindingsLoading ||
    isHostsLoading ||
    isNetworksLoading ||
    isServicesLoading
  ) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    )
  }

  if (
    addressGroupError ||
    hostBindingsError ||
    networkBindingsError ||
    serviceBindingsError ||
    hostsError ||
    networksError ||
    servicesError
  ) {
    return <Alert type="error" title="Error while loading AddressGroup details" />
  }

  if (!addressGroup) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="AddressGroup was not found." />
  }

  return (
    <Flex gap={8} wrap="wrap">
      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
        <Flex gap={24} vertical>
          <DetailField label="Default action">
            <Switch
              checked={(addressGroup.spec?.defaultAction || 'Deny') === 'Allow'}
              checkedChildren="Allow"
              loading={isDefaultActionSubmitting}
              unCheckedChildren="Deny"
              onChange={handleDefaultActionChange}
            />
          </DetailField>
          <DetailField label="Logs">{renderBooleanStatusIcon(Boolean(addressGroup.spec?.logs))}</DetailField>
          <DetailField label="Trace">{renderBooleanStatusIcon(Boolean(addressGroup.spec?.trace))}</DetailField>
          <DetailField label="Description" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>
              {renderValue(addressGroup.spec?.description)}
            </Typography.Paragraph>
          </DetailField>
          <DetailField label="Comment" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(addressGroup.spec?.comment)}</Typography.Paragraph>
          </DetailField>
        </Flex>
      </Card>

      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Entities</Typography.Text>
        <TreeContainer>
          <Tree showLine switcherIcon={<CaretDownOutlined />} treeData={entitiesTreeData} />
        </TreeContainer>
      </Card>
    </Flex>
  )
}
