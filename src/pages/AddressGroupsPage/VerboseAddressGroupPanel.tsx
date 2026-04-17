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
import { formatDateTime, formatMapEntries } from '../HostsPage/tableConfig'
import { Styled } from './styled'
import { formatBooleanFlag, TAddressGroupRow } from './tableConfig'
import {
  buildAddressGroupContentsTree,
  THostBindingResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from './contentsTree'

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

const renderMapValues = (value?: Record<string, string>) => {
  const entries = formatMapEntries(value)

  if (entries.length === 0) {
    return '-'
  }

  return (
    <Styled.TagsContainer>
      {entries.map(item => (
        <Styled.InfoTag key={item}>{item}</Styled.InfoTag>
      ))}
    </Styled.TagsContainer>
  )
}

const renderRefs = (addressGroup: TAddressGroupRow) => {
  if (!addressGroup.refs || addressGroup.refs.length === 0) {
    return <Typography.Text type="secondary">No related refs</Typography.Text>
  }

  return (
    <Styled.TagsContainer>
      {addressGroup.refs.map(ref => {
        const key = `${ref.kind || 'unknown'}-${ref.namespace || 'all'}-${ref.name || 'unnamed'}`

        return (
          <Styled.InfoTag key={key}>
            {`${ref.kind || 'Unknown kind'} / ${ref.namespace || '-'} / ${ref.name || '-'}`}
          </Styled.InfoTag>
        )
      })}
    </Styled.TagsContainer>
  )
}

const renderDefaultAction = (value?: string) => {
  if (!value) {
    return '-'
  }

  return <Styled.InfoTag color={value === 'Allow' ? 'green' : 'red'}>{value}</Styled.InfoTag>
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
  const resourceRequestBase = {
    cluster: cluster || '',
    namespace,
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
    ...resourceRequestBase,
    plural: 'hostbindings',
  })
  const {
    data: networkBindingsData,
    isLoading: isNetworkBindingsLoading,
    error: networkBindingsError,
  } = useK8sSmartResource<{
    items: TNetworkBindingResource[]
  }>({
    ...resourceRequestBase,
    plural: 'networkbindings',
  })
  const {
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{
    items: TServiceBindingResource[]
  }>({
    ...resourceRequestBase,
    plural: 'servicebindings',
  })
  const {
    data: hostsData,
    isLoading: isHostsLoading,
    error: hostsError,
  } = useK8sSmartResource<{
    items: import('../HostsPage/tableConfig').THostResource[]
  }>({
    ...resourceRequestBase,
    plural: 'hosts',
  })
  const {
    data: networksData,
    isLoading: isNetworksLoading,
    error: networksError,
  } = useK8sSmartResource<{
    items: TNetworkResource[]
  }>({
    ...resourceRequestBase,
    plural: 'networks',
  })
  const {
    data: servicesData,
    isLoading: isServicesLoading,
    error: servicesError,
  } = useK8sSmartResource<{
    items: TServiceResource[]
  }>({
    ...resourceRequestBase,
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
    <Styled.VerboseContainer>
      <Styled.CustomCard>
        <Styled.TitleAndControlsRow>
          <Styled.TitleAndExpandCollapse>
            {width === Styled.DETAIL_PANEL_MIN_WIDTH ? (
              <Styled.ExpandCollapseButton type="text" onClick={onExpand} icon={<ExpandOutlined />} />
            ) : (
              <Styled.ExpandCollapseButton type="text" onClick={onCollapse} icon={<CompressOutlined />} />
            )}
            <Styled.Title>{addressGroup.metadata.name || 'Address Group'}</Styled.Title>
          </Styled.TitleAndExpandCollapse>
          <div>
            <Styled.CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </Styled.TitleAndControlsRow>
        <Styled.OverflowContainer>
          <Styled.SpecGrid>
            <Typography.Text type="secondary">Name</Typography.Text>
            <div>{renderValue(addressGroup.metadata.name)}</div>

            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderValue(addressGroup.metadata.namespace)}</div>

            <Typography.Text type="secondary">Display Name</Typography.Text>
            <div>{renderValue(addressGroup.spec?.displayName)}</div>

            <Typography.Text type="secondary">Default Action</Typography.Text>
            <div>{renderDefaultAction(addressGroup.spec?.defaultAction)}</div>

            <Typography.Text type="secondary">Logs</Typography.Text>
            <div>{formatBooleanFlag(addressGroup.spec?.logs)}</div>

            <Typography.Text type="secondary">Trace</Typography.Text>
            <div>{formatBooleanFlag(addressGroup.spec?.trace)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(addressGroup.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(addressGroup.spec?.comment)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{formatDateTime(addressGroup.metadata.creationTimestamp)}</div>

            <Typography.Text type="secondary">Labels</Typography.Text>
            <div>{renderMapValues(addressGroup.metadata.labels)}</div>

            <Typography.Text type="secondary">Annotations</Typography.Text>
            <div>{renderMapValues(addressGroup.metadata.annotations)}</div>
          </Styled.SpecGrid>

          <Styled.DividerLine $backgroundColor={token.colorBorder} />

          <Styled.SubtitleWithIcon>
            <Styled.Icon>
              <ApartmentOutlined />
            </Styled.Icon>
            <Styled.Subtitle>Entities</Styled.Subtitle>
          </Styled.SubtitleWithIcon>
          {isContentsLoading ? (
            <Spin />
          ) : (
            <Styled.TreeContainer>
              <Tree
                showLine
                defaultExpandedKeys={['hosts-root', 'networks-root', 'services-root']}
                switcherIcon={<CaretDownOutlined />}
                treeData={treeData}
              />
            </Styled.TreeContainer>
          )}

          <Styled.DividerLine $backgroundColor={token.colorBorder} />

          <Styled.SubtitleWithIcon>
            <Styled.Icon>
              <ApartmentOutlined />
            </Styled.Icon>
            <Styled.Subtitle>Related Refs</Styled.Subtitle>
          </Styled.SubtitleWithIcon>
          {renderRefs(addressGroup)}
        </Styled.OverflowContainer>
      </Styled.CustomCard>
    </Styled.VerboseContainer>
  )
}
