import React, { FC, useMemo, useState } from 'react'
import {
  ApartmentOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CompressOutlined,
  CopyOutlined,
  DownOutlined,
  ExpandOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { message, Spin, Tree, Typography, theme as antdTheme } from 'antd'
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
import { TAddressGroupResource, THostBindingResource, TResourceIdentifier } from 'localTypes'
import {
  formatAnnotationEntries,
  formatMapEntries,
  groupTreeDataByNamespace,
  renderBadgeWithValue,
  renderNamespaceBadgeWithValue,
  renderTimestampWithIcon,
} from 'utils'
import { THostRow } from '../../tableConfig'

const SpecGridHosts = SpecGrid

type TVerboseHostPanelProps = {
  cluster?: string
  namespace?: string
  host: THostRow
  width?: number
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

const renderValue = (value?: string) => value || '-'

const MAX_VISIBLE_TAGS = 5
const EMPTY_LEAF_TITLE = 'No bound address groups'
const ERROR_LEAF_TITLE = 'Error while fetching'
const NOT_FOUND_LEAF_TITLE = 'Not found'

const makeLookupKey = (identifier?: TResourceIdentifier) =>
  `${identifier?.namespace || 'all'}::${identifier?.name || 'unknown'}`

const withNamespaceLabel = (name?: string) => {
  if (!name) {
    return 'Unknown'
  }

  return renderBadgeWithValue('Address Group', name)
}

const renderAddressGroupLabel = (addressGroup?: TAddressGroupResource, fallback?: TResourceIdentifier) => {
  if (addressGroup?.spec?.displayName) {
    return withNamespaceLabel(addressGroup.spec.displayName)
  }

  if (addressGroup?.metadata?.name) {
    return withNamespaceLabel(addressGroup.metadata.name)
  }

  return withNamespaceLabel(fallback?.name)
}

const createLeaf = (title: React.ReactNode, key: string): TreeDataNode => ({
  title,
  key,
  isLeaf: true,
})

const makeChildKey = (parentKey: string, key: string) => `${parentKey}-${key}`

const TagList: FC<{ values: string[]; onCopy?: boolean }> = ({ values, onCopy }) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [expanded, setExpanded] = useState(false)
  const visibleValues = expanded ? values : values.slice(0, MAX_VISIBLE_TAGS)

  const handleCopy = async (value: string) => {
    if (!onCopy) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      messageApi.success(`Copied: ${value}`)
    } catch {
      messageApi.error('Failed to copy text')
    }
  }

  if (values.length === 0) {
    return <>-</>
  }

  return (
    <>
      <TagsContainer>
        {visibleValues.map(value => (
          <InfoTag
            key={value}
            style={{ cursor: onCopy ? 'pointer' : 'default' }}
            onClick={onCopy ? () => handleCopy(value) : undefined}
          >
            {onCopy && <CopyOutlined style={{ marginRight: 6 }} />}
            {value}
          </InfoTag>
        ))}
      </TagsContainer>
      {values.length > MAX_VISIBLE_TAGS && (
        <ViewMoreTag onClick={() => setExpanded(current => !current)}>
          Show {expanded ? 'less' : `more (${values.length - MAX_VISIBLE_TAGS})`}{' '}
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </ViewMoreTag>
      )}
      {contextHolder}
    </>
  )
}

const renderTagList = (values: string[], onCopy?: boolean) => <TagList values={values} onCopy={onCopy} />

const buildBoundAddressGroupsTree = ({
  host,
  bindings,
  addressGroups,
  bindingsError,
  addressGroupsError,
}: {
  host: THostRow
  bindings?: THostBindingResource[]
  addressGroups?: TAddressGroupResource[]
  bindingsError?: boolean
  addressGroupsError?: boolean
}): { treeData: TreeDataNode[]; count: number } => {
  const rootKey = 'bound-address-groups-root'

  if (bindingsError) {
    return {
      treeData: [createLeaf(ERROR_LEAF_TITLE, makeChildKey(rootKey, 'host-bindings-error'))],
      count: 0,
    }
  }

  const targetKey = makeLookupKey(host.metadata)
  const addressGroupsByKey = Object.fromEntries(
    (addressGroups || []).map(group => [makeLookupKey(group.metadata), group]),
  )

  const matchedBindings = (bindings || []).filter(binding => makeLookupKey(binding.spec?.host) === targetKey)
  const children = matchedBindings.map(binding => {
    const addressGroup = addressGroupsByKey[makeLookupKey(binding.spec?.addressGroup)]
    const bindingKey = makeChildKey(
      rootKey,
      `host-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || 'unknown'}`,
    )
    const title = renderAddressGroupLabel(addressGroup, binding.spec?.addressGroup)

    if (!addressGroup) {
      return {
        namespace: binding.spec?.addressGroup?.namespace,
        node: {
          title,
          key: bindingKey,
          children: [
            createLeaf(
              addressGroupsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE,
              makeChildKey(bindingKey, 'status'),
            ),
          ],
        },
      }
    }

    return {
      namespace: addressGroup.metadata.namespace || binding.spec?.addressGroup?.namespace,
      node: {
        title,
        key: bindingKey,
        isLeaf: true,
      },
    }
  })
  const treeData = groupTreeDataByNamespace(children, rootKey)

  return {
    treeData: treeData.length > 0 ? treeData : [createLeaf(EMPTY_LEAF_TITLE, makeChildKey(rootKey, 'empty'))],
    count: children.length,
  }
}

export const VerboseHostPanel: FC<TVerboseHostPanelProps> = ({
  cluster,
  namespace,
  host,
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
  } = useK8sSmartResource<{ items: THostBindingResource[] }>({
    ...resourceRequestBase,
    plural: 'hostbindings',
  })
  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items: TAddressGroupResource[] }>({
    ...resourceRequestBase,
    plural: 'addressgroups',
  })

  const labels = useMemo(() => formatMapEntries(host.metadata.labels), [host.metadata.labels])
  const annotations = useMemo(() => formatAnnotationEntries(host.metadata.annotations), [host.metadata.annotations])
  const boundAddressGroups = useMemo(
    () =>
      buildBoundAddressGroupsTree({
        host,
        bindings: hostBindingsData?.items,
        addressGroups: addressGroupsData?.items,
        bindingsError: Boolean(hostBindingsError),
        addressGroupsError: Boolean(addressGroupsError),
      }),
    [host, hostBindingsData?.items, addressGroupsData?.items, hostBindingsError, addressGroupsError],
  )
  const metaInfo = host.metaInfo || host.spec?.metaInfo
  const ips = host.ips || host.spec?.IPs

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
            <Title>{renderBadgeWithValue('Host', host.metadata.name || 'Host')}</Title>
          </TitleAndExpandCollapse>
          <div>
            <CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </TitleAndControlsRow>
        <OverflowContainer>
          <SpecGridHosts>
            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderNamespaceBadgeWithValue(host.metadata.namespace)}</div>

            <Typography.Text type="secondary">Display Name</Typography.Text>
            <div>{renderValue(host.spec?.displayName)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(host.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(host.spec?.comment)}</div>

            <Typography.Text type="secondary">Host Name</Typography.Text>
            <div>{renderValue(metaInfo?.hostName)}</div>

            <Typography.Text type="secondary">OS</Typography.Text>
            <div>{renderValue(metaInfo?.os)}</div>

            <Typography.Text type="secondary">Platform</Typography.Text>
            <div>{renderValue(metaInfo?.platform)}</div>

            <Typography.Text type="secondary">Platform Family</Typography.Text>
            <div>{renderValue(metaInfo?.platformFamily)}</div>

            <Typography.Text type="secondary">Platform Version</Typography.Text>
            <div>{renderValue(metaInfo?.platformVersion)}</div>

            <Typography.Text type="secondary">Kernel Version</Typography.Text>
            <div>{renderValue(metaInfo?.kernelVersion)}</div>

            <Typography.Text type="secondary">IPv4</Typography.Text>
            <div>{renderTagList(ips?.IPv4 || [], true)}</div>

            <Typography.Text type="secondary">IPv6</Typography.Text>
            <div>{renderTagList(ips?.IPv6 || [], true)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{renderTimestampWithIcon(host.metadata.creationTimestamp)}</div>

            <Typography.Text type="secondary">Labels</Typography.Text>
            <div>{renderTagList(labels)}</div>

            <Typography.Text type="secondary">Annotations</Typography.Text>
            <div>{renderTagList(annotations)}</div>
          </SpecGridHosts>

          <DividerLine $backgroundColor={token.colorBorder} />

          <SubtitleWithIcon>
            <Icon>
              <ApartmentOutlined />
            </Icon>
            <Subtitle>
              Bound Address Groups{' '}
              <span style={{ color: token.colorPrimaryActive, fontWeight: 600 }}>({boundAddressGroups.count})</span>
            </Subtitle>
          </SubtitleWithIcon>
          {isHostBindingsLoading || isAddressGroupsLoading ? (
            <Spin />
          ) : (
            <TreeContainer>
              <Tree showLine switcherIcon={<CaretDownOutlined />} treeData={boundAddressGroups.treeData} />
            </TreeContainer>
          )}
        </OverflowContainer>
      </CustomCard>
    </VerboseContainer>
  )
}
