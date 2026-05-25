import React, { FC, useMemo } from 'react'
import {
  ApartmentOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
} from '@ant-design/icons'
import { Spin, Tree, Typography, theme as antdTheme } from 'antd'
import type { TreeDataNode } from 'antd'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import {
  CloseButton,
  CustomCard,
  DETAIL_PANEL_MIN_WIDTH,
  DividerLine,
  ExpandCollapseButton,
  Icon,
  InfoTag,
  OverflowContainer,
  SpecGrid,
  Subtitle,
  SubtitleWithIcon,
  TagsContainer,
  Title,
  TitleAndControlsRow,
  TitleAndExpandCollapse,
  TreeContainer,
  VerboseContainer,
} from 'components/atoms'
import {
  formatAnnotationEntries,
  formatMapEntries,
  renderBooleanStatusIcon,
  renderBadgeWithValue,
  renderNamespaceBadgeWithValue,
  renderTimestampWithIcon,
} from 'utils'
import {
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { TAddressGroupRow } from '../../tableConfig'
import { buildAddressGroupContentsTree } from './contentsTree'

type TVerboseAddressGroupPanelProps = {
  cluster?: string
  namespace?: string
  addressGroup: TAddressGroupRow
  width?: number
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

const renderValue = (value?: string) => value || '-'

const renderMapValues = (value?: Record<string, string>, options?: { excludeKubectlAnnotations?: boolean }) => {
  const entries = options?.excludeKubectlAnnotations ? formatAnnotationEntries(value) : formatMapEntries(value)

  if (entries.length === 0) {
    return '-'
  }

  return (
    <TagsContainer>
      {entries.map(item => (
        <InfoTag key={item}>{item}</InfoTag>
      ))}
    </TagsContainer>
  )
}

const renderDefaultAction = (value?: string) => {
  if (!value) {
    return '-'
  }

  return <InfoTag color={value === 'Allow' ? 'green' : 'red'}>{value}</InfoTag>
}

export const VerboseAddressGroupPanel: FC<TVerboseAddressGroupPanelProps> = ({
  cluster,
  namespace,
  addressGroup,
  width,
  onClose,
  onExpand,
  onCollapse,
}) => {
  const { token } = antdTheme.useToken()

  const addressGroupNamespace = addressGroup.metadata.namespace || namespace
  const addressGroupScopedRequestBase = {
    cluster: cluster || '',
    namespace: addressGroupNamespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    isEnabled: Boolean(cluster && addressGroupNamespace),
  } as const
  const clusterScopedRequestBase = {
    cluster: cluster || '',
    namespace: undefined,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    isEnabled: Boolean(cluster),
  } as const

  const {
    data: hostBindingsData,
    isLoading: isHostBindingsLoading,
    error: hostBindingsError,
  } = useK8sSmartResource<{
    items: THostBindingResource[]
  }>({
    ...addressGroupScopedRequestBase,
    plural: 'hostbindings',
  })
  const {
    data: networkBindingsData,
    isLoading: isNetworkBindingsLoading,
    error: networkBindingsError,
  } = useK8sSmartResource<{
    items: TNetworkBindingResource[]
  }>({
    ...addressGroupScopedRequestBase,
    plural: 'networkbindings',
  })
  const {
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{
    items: TServiceBindingResource[]
  }>({
    ...clusterScopedRequestBase,
    plural: 'servicebindings',
  })
  const {
    data: hostsData,
    isLoading: isHostsLoading,
    error: hostsError,
  } = useK8sSmartResource<{
    items: THostResource[]
  }>({
    ...addressGroupScopedRequestBase,
    plural: 'hosts',
  })
  const {
    data: networksData,
    isLoading: isNetworksLoading,
    error: networksError,
  } = useK8sSmartResource<{
    items: TNetworkResource[]
  }>({
    ...addressGroupScopedRequestBase,
    plural: 'networks',
  })
  const {
    data: servicesData,
    isLoading: isServicesLoading,
    error: servicesError,
  } = useK8sSmartResource<{
    items: TServiceResource[]
  }>({
    ...clusterScopedRequestBase,
    plural: 'services',
  })

  const treeData = useMemo<TreeDataNode[]>(
    () =>
      buildAddressGroupContentsTree({
        addressGroupName: addressGroup.metadata.name,
        addressGroupNamespace: addressGroup.metadata.namespace,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
        hostBindingsError: Boolean(hostBindingsError),
        networkBindingsError: Boolean(networkBindingsError),
        serviceBindingsError: Boolean(serviceBindingsError),
        hostsError: Boolean(hostsError),
        networksError: Boolean(networksError),
        servicesError: Boolean(servicesError),
        countColor: token.colorPrimaryActive,
      }),
    [
      addressGroup.metadata.name,
      addressGroup.metadata.namespace,
      hostBindingsData?.items,
      networkBindingsData?.items,
      serviceBindingsData?.items,
      hostsData?.items,
      networksData?.items,
      servicesData?.items,
      hostBindingsError,
      networkBindingsError,
      serviceBindingsError,
      hostsError,
      networksError,
      servicesError,
      token.colorPrimaryActive,
    ],
  )

  const isContentsLoading =
    isHostBindingsLoading ||
    isNetworkBindingsLoading ||
    isServiceBindingsLoading ||
    isHostsLoading ||
    isNetworksLoading ||
    isServicesLoading

  return (
    <VerboseContainer>
      <CustomCard>
        <TitleAndControlsRow>
          <TitleAndExpandCollapse>
            {width === DETAIL_PANEL_MIN_WIDTH ? (
              <ExpandCollapseButton type="text" onClick={onExpand} icon={<ExpandOutlined />} />
            ) : (
              <ExpandCollapseButton type="text" onClick={onCollapse} icon={<CompressOutlined />} />
            )}
            <Title>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {renderBadgeWithValue(
                  'AddressGroup',
                  addressGroup.spec?.displayName || addressGroup.metadata.name || 'Address Group',
                )}
                {renderDefaultAction(addressGroup.spec?.defaultAction)}
              </span>
            </Title>
          </TitleAndExpandCollapse>
          <div>
            <CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </TitleAndControlsRow>
        <OverflowContainer>
          <SpecGrid>
            <Typography.Text type="secondary">Tenant</Typography.Text>
            <div>{renderNamespaceBadgeWithValue(addressGroup.metadata.namespace)}</div>

            <Typography.Text type="secondary">Logs</Typography.Text>
            <div>{renderBooleanStatusIcon(addressGroup.spec?.logs)}</div>

            <Typography.Text type="secondary">Trace</Typography.Text>
            <div>{renderBooleanStatusIcon(addressGroup.spec?.trace)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(addressGroup.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(addressGroup.spec?.comment)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{renderTimestampWithIcon(addressGroup.metadata.creationTimestamp)}</div>

            <Typography.Text type="secondary">Labels</Typography.Text>
            <div>{renderMapValues(addressGroup.metadata.labels)}</div>

            <Typography.Text type="secondary">Annotations</Typography.Text>
            <div>{renderMapValues(addressGroup.metadata.annotations, { excludeKubectlAnnotations: true })}</div>
          </SpecGrid>

          <DividerLine $backgroundColor={token.colorBorder} />

          <SubtitleWithIcon>
            <Icon>
              <ApartmentOutlined />
            </Icon>
            <Subtitle>Entities</Subtitle>
          </SubtitleWithIcon>
          {isContentsLoading ? (
            <Spin />
          ) : (
            <TreeContainer>
              <Tree showLine switcherIcon={<CaretDownOutlined />} treeData={treeData} />
            </TreeContainer>
          )}
        </OverflowContainer>
      </CustomCard>
    </VerboseContainer>
  )
}
