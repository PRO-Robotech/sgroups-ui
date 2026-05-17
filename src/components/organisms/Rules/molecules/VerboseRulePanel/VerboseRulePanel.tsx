/* eslint-disable react/no-array-index-key */
import React, { FC, useMemo, useState } from 'react'
import {
  ApartmentOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CompressOutlined,
  DownOutlined,
  ExpandOutlined,
  PartitionOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { Spin, Tooltip, Tree, Typography, theme as antdTheme } from 'antd'
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
  ViewMoreTag,
} from 'components/atoms'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import {
  formatAnnotationEntries,
  formatMapEntries,
  formatTrafficValue,
  renderBadgeWithValue,
  renderNamespaceBadgeWithValue,
  renderTimestampWithIcon,
} from 'utils'
import { buildRuleEndpointTree } from './contentsTree'
import {
  renderEndpointLabel,
  TEndpointDisplayLookup,
  TRuleEndpoint,
  TRuleRow,
  TRuleTransportEntry,
} from '../../tableConfig'

type TVerboseRulePanelProps = {
  cluster?: string
  namespace?: string
  rule: TRuleRow
  width?: number
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

const MAX_VISIBLE_TAGS = 5

const renderValue = (value?: string) => value || '-'

const renderAction = (value?: string) => {
  if (!value) {
    return '-'
  }

  return <InfoTag color={value === 'Allow' ? 'green' : 'red'}>{value}</InfoTag>
}

const renderEndpointSummary = (endpoint?: TRuleEndpoint, endpointDisplayLookup: TEndpointDisplayLookup = {}) => {
  if (!endpoint) {
    return '-'
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    return endpoint.value || '-'
  }

  return renderEndpointLabel(endpoint, endpointDisplayLookup)
}

const TagList: FC<{ values: string[] }> = ({ values }) => {
  const [expanded, setExpanded] = useState(false)
  const visibleValues = expanded ? values : values.slice(0, MAX_VISIBLE_TAGS)

  if (values.length === 0) {
    return <>-</>
  }

  return (
    <>
      <TagsContainer>
        {visibleValues.map(value => (
          <InfoTag key={value}>{value}</InfoTag>
        ))}
      </TagsContainer>
      {values.length > MAX_VISIBLE_TAGS && (
        <ViewMoreTag onClick={() => setExpanded(current => !current)}>
          Show {expanded ? 'less' : `more (${values.length - MAX_VISIBLE_TAGS})`}{' '}
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </ViewMoreTag>
      )}
    </>
  )
}

const renderTagList = (values: string[]) => <TagList values={values} />

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

  return (
    <>
      {details.map(([label, value]) => (
        <div key={label}>
          <Typography.Text strong>{label}:</Typography.Text> {value}
        </div>
      ))}
    </>
  )
}

const TransportEntries: FC<{ entries?: TRuleTransportEntry[] }> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return <>-</>
  }

  return (
    <TagsContainer>
      {entries.map((entry, index) => {
        const text = formatTransportEntryText(entry, index)
        const tooltip = renderTransportEntryTooltip(entry)
        const tag = <InfoTag key={`${text}-${index}`}>{text}</InfoTag>

        return tooltip ? (
          <Tooltip key={`${text}-${index}`} title={tooltip}>
            {tag}
          </Tooltip>
        ) : (
          tag
        )
      })}
    </TagsContainer>
  )
}

export const VerboseRulePanel: FC<TVerboseRulePanelProps> = ({
  cluster,
  namespace,
  rule,
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
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items: TAddressGroupResource[] }>({
    ...resourceRequestBase,
    namespace: undefined,
    plural: 'addressgroups',
  })
  const {
    data: hostBindingsData,
    isLoading: isHostBindingsLoading,
    error: hostBindingsError,
  } = useK8sSmartResource<{ items: THostBindingResource[] }>({
    ...resourceRequestBase,
    plural: 'hostbindings',
  })
  const {
    data: networkBindingsData,
    isLoading: isNetworkBindingsLoading,
    error: networkBindingsError,
  } = useK8sSmartResource<{ items: TNetworkBindingResource[] }>({
    ...resourceRequestBase,
    plural: 'networkbindings',
  })
  const {
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{ items: TServiceBindingResource[] }>({
    ...resourceRequestBase,
    plural: 'servicebindings',
  })
  const {
    data: hostsData,
    isLoading: isHostsLoading,
    error: hostsError,
  } = useK8sSmartResource<{ items: THostResource[] }>({
    ...resourceRequestBase,
    plural: 'hosts',
  })
  const {
    data: networksData,
    isLoading: isNetworksLoading,
    error: networksError,
  } = useK8sSmartResource<{ items: TNetworkResource[] }>({
    ...resourceRequestBase,
    plural: 'networks',
  })
  const {
    data: servicesData,
    isLoading: isServicesLoading,
    error: servicesError,
  } = useK8sSmartResource<{ items: TServiceResource[] }>({
    ...resourceRequestBase,
    namespace: undefined,
    plural: 'services',
  })

  const endpointDisplayLookup = useMemo<TEndpointDisplayLookup>(() => {
    const lookup: TEndpointDisplayLookup = {}

    const addResource = (resource: TAddressGroupResource | TServiceResource) => {
      const { name, namespace: resourceNamespace } = resource.metadata

      if (!name || !resourceNamespace) {
        return
      }

      lookup[`${resourceNamespace}/${name}`] = resource.spec?.displayName || name
    }

    addressGroupsData?.items.forEach(addResource)
    servicesData?.items.forEach(addResource)

    return lookup
  }, [addressGroupsData?.items, servicesData?.items])

  const labels = useMemo(() => formatMapEntries(rule.metadata.labels), [rule.metadata.labels])
  const annotations = useMemo(() => formatAnnotationEntries(rule.metadata.annotations), [rule.metadata.annotations])
  const localTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildRuleEndpointTree({
        endpoint: rule.spec?.endpoints?.local,
        addressGroups: addressGroupsData?.items,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
        addressGroupsError: Boolean(addressGroupsError),
        hostBindingsError: Boolean(hostBindingsError),
        networkBindingsError: Boolean(networkBindingsError),
        serviceBindingsError: Boolean(serviceBindingsError),
        hostsError: Boolean(hostsError),
        networksError: Boolean(networksError),
        servicesError: Boolean(servicesError),
        countColor: token.colorPrimaryActive,
      }),
    [
      rule.spec?.endpoints?.local,
      addressGroupsData?.items,
      hostBindingsData?.items,
      networkBindingsData?.items,
      serviceBindingsData?.items,
      hostsData?.items,
      networksData?.items,
      servicesData?.items,
      addressGroupsError,
      hostBindingsError,
      networkBindingsError,
      serviceBindingsError,
      hostsError,
      networksError,
      servicesError,
      token.colorPrimaryActive,
    ],
  )

  const remoteTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildRuleEndpointTree({
        endpoint: rule.spec?.endpoints?.remote,
        addressGroups: addressGroupsData?.items,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
        addressGroupsError: Boolean(addressGroupsError),
        hostBindingsError: Boolean(hostBindingsError),
        networkBindingsError: Boolean(networkBindingsError),
        serviceBindingsError: Boolean(serviceBindingsError),
        hostsError: Boolean(hostsError),
        networksError: Boolean(networksError),
        servicesError: Boolean(servicesError),
        countColor: token.colorPrimaryActive,
      }),
    [
      rule.spec?.endpoints?.remote,
      addressGroupsData?.items,
      hostBindingsData?.items,
      networkBindingsData?.items,
      serviceBindingsData?.items,
      hostsData?.items,
      networksData?.items,
      servicesData?.items,
      addressGroupsError,
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
    isAddressGroupsLoading ||
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
            <Title>{renderBadgeWithValue('Rule', rule.spec?.displayName || rule.metadata.name || 'Rule')}</Title>
          </TitleAndExpandCollapse>
          <div>
            <CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </TitleAndControlsRow>
        <OverflowContainer>
          <SpecGrid>
            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderNamespaceBadgeWithValue(rule.metadata.namespace)}</div>

            <Typography.Text type="secondary">Action</Typography.Text>
            <div>{renderAction(rule.spec?.action)}</div>

            <Typography.Text type="secondary">Traffic</Typography.Text>
            <div>{formatTrafficValue(rule.spec?.session?.traffic)}</div>

            <Typography.Text type="secondary">Protocol</Typography.Text>
            <div>{renderValue(rule.spec?.transport?.protocol)}</div>

            <Typography.Text type="secondary">IP Family</Typography.Text>
            <div>{renderValue(rule.spec?.transport?.IPv)}</div>

            <Typography.Text type="secondary">Transport Entries</Typography.Text>
            <div>
              <TransportEntries entries={rule.spec?.transport?.entries} />
            </div>

            <Typography.Text type="secondary">Local</Typography.Text>
            <div>{renderEndpointSummary(rule.spec?.endpoints?.local, endpointDisplayLookup)}</div>

            <Typography.Text type="secondary">Remote</Typography.Text>
            <div>{renderEndpointSummary(rule.spec?.endpoints?.remote, endpointDisplayLookup)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(rule.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(rule.spec?.comment)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{renderTimestampWithIcon(rule.metadata.creationTimestamp)}</div>

            <Typography.Text type="secondary">Labels</Typography.Text>
            <div>{renderTagList(labels)}</div>

            <Typography.Text type="secondary">Annotations</Typography.Text>
            <div>{renderTagList(annotations)}</div>
          </SpecGrid>

          <DividerLine $backgroundColor={token.colorBorder} />

          <SubtitleWithIcon>
            <Icon>
              <ApartmentOutlined />
            </Icon>
            <Subtitle>Source</Subtitle>
          </SubtitleWithIcon>
          {isContentsLoading ? (
            <Spin />
          ) : (
            <TreeContainer>
              <Tree showLine switcherIcon={<CaretDownOutlined />} treeData={localTreeData} />
            </TreeContainer>
          )}

          <DividerLine $backgroundColor={token.colorBorder} />

          <SubtitleWithIcon>
            <Icon>
              <PartitionOutlined />
            </Icon>
            <Subtitle>Destination</Subtitle>
          </SubtitleWithIcon>
          {isContentsLoading ? (
            <Spin />
          ) : (
            <TreeContainer>
              <Tree showLine switcherIcon={<CaretDownOutlined />} treeData={remoteTreeData} />
            </TreeContainer>
          )}
        </OverflowContainer>
      </CustomCard>
    </VerboseContainer>
  )
}
