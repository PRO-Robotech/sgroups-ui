import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import {
  ApartmentOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CompressOutlined,
  DownOutlined,
  ExpandOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { Spin, Tree, Typography, theme as antdTheme } from 'antd'
import type { TreeDataNode } from 'antd'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { formatDateTime, formatMapEntries } from '../HostsPage/tableConfig'
import { Styled } from './styled'
import { TNetworkRow } from './tableConfig'

type TResourceIdentifier = {
  name?: string
  namespace?: string
}

type TAddressGroupResource = {
  metadata: {
    name?: string
    namespace?: string
  }
  spec?: {
    displayName?: string
  }
}

type TNetworkBindingResource = {
  metadata: {
    name?: string
    namespace?: string
  }
  spec?: {
    displayName?: string
    addressGroup?: TResourceIdentifier
    network?: TResourceIdentifier
  }
}

type TVerboseNetworkPanelProps = {
  cluster?: string
  namespace?: string
  network: TNetworkRow
  width?: number
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

const MAX_VISIBLE_TAGS = 5
const EMPTY_LEAF_TITLE = 'No bound address groups'
const ERROR_LEAF_TITLE = 'Error while fetching'
const NOT_FOUND_LEAF_TITLE = 'Not found'

const renderValue = (value?: string) => value || '-'

const makeLookupKey = (identifier?: TResourceIdentifier) =>
  `${identifier?.namespace || 'all'}::${identifier?.name || 'unknown'}`

const withNamespaceLabel = (name?: string, namespace?: string) => {
  if (!name) {
    return 'Unknown'
  }

  return namespace ? `${name} (${namespace})` : name
}

const renderAddressGroupLabel = (addressGroup?: TAddressGroupResource, fallback?: TResourceIdentifier) => {
  if (addressGroup?.spec?.displayName) {
    return withNamespaceLabel(addressGroup.spec.displayName, addressGroup.metadata.namespace || fallback?.namespace)
  }

  if (addressGroup?.metadata?.name) {
    return withNamespaceLabel(addressGroup.metadata.name, addressGroup.metadata.namespace)
  }

  return withNamespaceLabel(fallback?.name, fallback?.namespace)
}

const createLeaf = (title: React.ReactNode, key: string): TreeDataNode => ({
  title,
  key,
  isLeaf: true,
})

const TagList: FC<{ values: string[] }> = ({ values }) => {
  const [expanded, setExpanded] = useState(false)
  const visibleValues = expanded ? values : values.slice(0, MAX_VISIBLE_TAGS)

  if (values.length === 0) {
    return <>-</>
  }

  return (
    <>
      <Styled.TagsContainer>
        {visibleValues.map(value => (
          <Styled.InfoTag key={value}>{value}</Styled.InfoTag>
        ))}
      </Styled.TagsContainer>
      {values.length > MAX_VISIBLE_TAGS && (
        <Styled.ViewMoreTag onClick={() => setExpanded(current => !current)}>
          Show {expanded ? 'less' : `more (${values.length - MAX_VISIBLE_TAGS})`}{' '}
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </Styled.ViewMoreTag>
      )}
    </>
  )
}

const renderTagList = (values: string[]) => <TagList values={values} />

const renderRefs = (network: TNetworkRow) => {
  if (!network.refs || network.refs.length === 0) {
    return <Typography.Text type="secondary">No related refs</Typography.Text>
  }

  const values = network.refs.map(ref => `${ref.kind || 'Unknown kind'} / ${ref.namespace || '-'} / ${ref.name || '-'}`)

  return renderTagList(values)
}

const buildBoundAddressGroupsTree = ({
  network,
  bindings,
  addressGroups,
  bindingsError,
  addressGroupsError,
  countColor,
}: {
  network: TNetworkRow
  bindings?: TNetworkBindingResource[]
  addressGroups?: TAddressGroupResource[]
  bindingsError?: boolean
  addressGroupsError?: boolean
  countColor?: string
}): TreeDataNode[] => {
  if (bindingsError) {
    return [createLeaf(ERROR_LEAF_TITLE, 'network-bindings-error')]
  }

  const targetKey = makeLookupKey(network.metadata)
  const addressGroupsByKey = Object.fromEntries(
    (addressGroups || []).map(group => [makeLookupKey(group.metadata), group]),
  )

  const matchedBindings = (bindings || []).filter(binding => makeLookupKey(binding.spec?.network) === targetKey)
  const children = matchedBindings.map(binding => {
    const addressGroup = addressGroupsByKey[makeLookupKey(binding.spec?.addressGroup)]
    const bindingKey = `network-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || 'unknown'}`
    const title =
      binding.spec?.displayName ||
      binding.metadata.name ||
      renderAddressGroupLabel(addressGroup, binding.spec?.addressGroup)

    if (!addressGroup) {
      return {
        title,
        key: bindingKey,
        children: [createLeaf(addressGroupsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${bindingKey}-status`)],
      }
    }

    return {
      title,
      key: bindingKey,
      children: [createLeaf(renderAddressGroupLabel(addressGroup, binding.spec?.addressGroup), `${bindingKey}-group`)],
    }
  })

  return [
    {
      title: (
        <>
          Bound Address Groups <span style={{ color: countColor, fontWeight: 600 }}>({children.length})</span>
        </>
      ),
      key: 'bound-address-groups-root',
      children: children.length > 0 ? children : [createLeaf(EMPTY_LEAF_TITLE, 'bound-address-groups-empty')],
    },
  ]
}

export const VerboseNetworkPanel: FC<TVerboseNetworkPanelProps> = ({
  cluster,
  namespace,
  network,
  width,
  onClose,
  onExpand,
  onCollapse,
}) => {
  const { token } = antdTheme.useToken()
  const titleRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const resourceRequestBase = {
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    isEnabled: Boolean(cluster),
  } as const

  const {
    data: networkBindingsData,
    isLoading: isNetworkBindingsLoading,
    error: networkBindingsError,
  } = useK8sSmartResource<{ items: TNetworkBindingResource[] }>({
    ...resourceRequestBase,
    plural: 'networkbindings',
  })
  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items: TAddressGroupResource[] }>({
    ...resourceRequestBase,
    plural: 'addressgroups',
  })

  const labels = useMemo(() => formatMapEntries(network.metadata.labels), [network.metadata.labels])
  const annotations = useMemo(() => formatMapEntries(network.metadata.annotations), [network.metadata.annotations])
  const boundAddressGroupsTree = useMemo<TreeDataNode[]>(
    () =>
      buildBoundAddressGroupsTree({
        network,
        bindings: networkBindingsData?.items,
        addressGroups: addressGroupsData?.items,
        bindingsError: Boolean(networkBindingsError),
        addressGroupsError: Boolean(addressGroupsError),
        countColor: token.colorPrimaryActive,
      }),
    [
      network,
      networkBindingsData?.items,
      addressGroupsData?.items,
      networkBindingsError,
      addressGroupsError,
      token.colorPrimaryActive,
    ],
  )

  useEffect(() => {
    const updateHeight = () => {
      const titleHeight = titleRef.current?.offsetHeight ?? 0
      setHeight(window.innerHeight - 232 - titleHeight)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => window.removeEventListener('resize', updateHeight)
  }, [width])

  return (
    <Styled.VerboseContainer>
      <Styled.CustomCard>
        <Styled.TitleAndControlsRow ref={titleRef}>
          <Styled.TitleAndExpandCollapse>
            {width === Styled.DETAIL_PANEL_MIN_WIDTH ? (
              <Styled.ExpandCollapseButton type="text" onClick={onExpand} icon={<ExpandOutlined />} />
            ) : (
              <Styled.ExpandCollapseButton type="text" onClick={onCollapse} icon={<CompressOutlined />} />
            )}
            <Styled.Title>{network.metadata.name || 'Network'}</Styled.Title>
          </Styled.TitleAndExpandCollapse>
          <div>
            <Styled.CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </Styled.TitleAndControlsRow>
        <Styled.OverflowContainer $height={height}>
          <Styled.SpecGrid>
            <Typography.Text type="secondary">Name</Typography.Text>
            <div>{renderValue(network.metadata.name)}</div>

            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderValue(network.metadata.namespace)}</div>

            <Typography.Text type="secondary">Display Name</Typography.Text>
            <div>{renderValue(network.spec?.displayName)}</div>

            <Typography.Text type="secondary">CIDR</Typography.Text>
            <div>{renderValue(network.spec?.CIDR)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(network.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(network.spec?.comment)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{formatDateTime(network.metadata.creationTimestamp)}</div>

            <Typography.Text type="secondary">Labels</Typography.Text>
            <div>{renderTagList(labels)}</div>

            <Typography.Text type="secondary">Annotations</Typography.Text>
            <div>{renderTagList(annotations)}</div>

            <Typography.Text type="secondary">Related Refs</Typography.Text>
            <div>{renderRefs(network)}</div>
          </Styled.SpecGrid>

          <Styled.DividerLine $backgroundColor={token.colorBorder} />

          <Styled.SubtitleWithIcon>
            <Styled.Icon>
              <ApartmentOutlined />
            </Styled.Icon>
            <Styled.Subtitle>Bound Address Groups</Styled.Subtitle>
          </Styled.SubtitleWithIcon>
          {isNetworkBindingsLoading || isAddressGroupsLoading ? (
            <Spin />
          ) : (
            <Styled.TreeContainer>
              <Tree
                showLine
                switcherIcon={<CaretDownOutlined />}
                defaultExpandedKeys={['bound-address-groups-root']}
                treeData={boundAddressGroupsTree}
              />
            </Styled.TreeContainer>
          )}
        </Styled.OverflowContainer>
      </Styled.CustomCard>
    </Styled.VerboseContainer>
  )
}
