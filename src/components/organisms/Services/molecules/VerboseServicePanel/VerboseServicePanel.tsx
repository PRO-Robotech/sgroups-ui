import React, { FC, useMemo, useState } from 'react'
import {
  ApartmentOutlined,
  CaretDownOutlined,
  CloseOutlined,
  CompressOutlined,
  DownOutlined,
  ExpandOutlined,
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
  TransportEntries,
  TransportGroup,
  TransportTitle,
  TreeContainer,
  VerboseContainer,
  ViewMoreTag,
} from 'components/atoms'
import { TAddressGroupResource, TResourceIdentifier, TServiceBindingResource } from 'localTypes'
import {
  formatAnnotationEntries,
  formatMapEntries,
  renderBadgeWithValue,
  renderNamespacedResourceValue,
  renderNamespaceBadgeWithValue,
  renderTimestampWithIcon,
} from 'utils'
import { TServiceRow, TServiceTransport, TServiceTransportEntry } from '../../tableConfig'

type TVerboseServicePanelProps = {
  cluster?: string
  namespace?: string
  service: TServiceRow
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

  return renderNamespacedResourceValue('Address Group', namespace, name)
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

const makeChildKey = (parentKey: string, key: string) => `${parentKey}-${key}`

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

const formatTransportEntryText = (entry: TServiceTransportEntry, index: number) => {
  const parts = []

  if (entry.ports) {
    parts.push(`Ports: ${entry.ports}`)
  }

  if (entry.types && entry.types.length > 0) {
    parts.push(`Types: ${entry.types.join(', ')}`)
  }

  if (entry.description && !entry.ports) {
    parts.push(`Description: ${entry.description}`)
  }

  if (entry.comment) {
    parts.push(`Comment: ${entry.comment}`)
  }

  return parts.join(' | ') || `Entry ${index + 1}`
}

const renderTransportEntry = (entry: TServiceTransportEntry, index: number) => {
  const text = formatTransportEntryText(entry, index)
  const tag = <InfoTag key={`${text}-${index}`}>{text}</InfoTag>

  return entry.ports && entry.description ? (
    <Tooltip key={`${text}-${index}`} title={entry.description}>
      {tag}
    </Tooltip>
  ) : (
    tag
  )
}

const renderTransport = (transport: TServiceTransport, index: number) => {
  const headerParts = [transport.protocol, transport.IPv].filter(Boolean)
  const header = headerParts.length > 0 ? headerParts.join(' / ') : `Transport ${index + 1}`

  return (
    <div key={`${header}-${index}`}>
      <TransportGroup>
        <TransportTitle>{header}</TransportTitle>
        <TransportEntries>
          {transport.entries && transport.entries.length > 0 ? (
            transport.entries.map(renderTransportEntry)
          ) : (
            <InfoTag>No entries</InfoTag>
          )}
        </TransportEntries>
      </TransportGroup>
    </div>
  )
}

const buildBoundAddressGroupsTree = ({
  service,
  bindings,
  addressGroups,
  bindingsError,
  addressGroupsError,
}: {
  service: TServiceRow
  bindings?: TServiceBindingResource[]
  addressGroups?: TAddressGroupResource[]
  bindingsError?: boolean
  addressGroupsError?: boolean
}): { treeData: TreeDataNode[]; count: number } => {
  const rootKey = 'bound-address-groups-root'

  if (bindingsError) {
    return {
      treeData: [createLeaf(ERROR_LEAF_TITLE, makeChildKey(rootKey, 'service-bindings-error'))],
      count: 0,
    }
  }

  const targetKey = makeLookupKey(service.metadata)
  const addressGroupsByKey = Object.fromEntries(
    (addressGroups || []).map(group => [makeLookupKey(group.metadata), group]),
  )

  const matchedBindings = (bindings || []).filter(binding => makeLookupKey(binding.spec?.service) === targetKey)
  const children = matchedBindings.map(binding => {
    const addressGroup = addressGroupsByKey[makeLookupKey(binding.spec?.addressGroup)]
    const bindingKey = makeChildKey(
      rootKey,
      `service-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || 'unknown'}`,
    )
    const title =
      binding.spec?.displayName ||
      binding.metadata.name ||
      renderAddressGroupLabel(addressGroup, binding.spec?.addressGroup)

    if (!addressGroup) {
      return {
        title,
        key: bindingKey,
        children: [
          createLeaf(addressGroupsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, makeChildKey(bindingKey, 'status')),
        ],
      }
    }

    return {
      title,
      key: bindingKey,
      children: [
        createLeaf(
          renderAddressGroupLabel(addressGroup, binding.spec?.addressGroup),
          makeChildKey(bindingKey, 'group'),
        ),
      ],
    }
  })

  return {
    treeData: children.length > 0 ? children : [createLeaf(EMPTY_LEAF_TITLE, makeChildKey(rootKey, 'empty'))],
    count: children.length,
  }
}

export const VerboseServicePanel: FC<TVerboseServicePanelProps> = ({
  cluster,
  namespace,
  service,
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
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{ items: TServiceBindingResource[] }>({
    ...resourceRequestBase,
    plural: 'servicebindings',
  })
  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items: TAddressGroupResource[] }>({
    ...resourceRequestBase,
    plural: 'addressgroups',
  })

  const labels = useMemo(() => formatMapEntries(service.metadata.labels), [service.metadata.labels])
  const annotations = useMemo(
    () => formatAnnotationEntries(service.metadata.annotations),
    [service.metadata.annotations],
  )
  const boundAddressGroups = useMemo(
    () =>
      buildBoundAddressGroupsTree({
        service,
        bindings: serviceBindingsData?.items,
        addressGroups: addressGroupsData?.items,
        bindingsError: Boolean(serviceBindingsError),
        addressGroupsError: Boolean(addressGroupsError),
      }),
    [service, serviceBindingsData?.items, addressGroupsData?.items, serviceBindingsError, addressGroupsError],
  )
  const transportDetails = useMemo(
    () => (service.spec?.transports || []).map(renderTransport),
    [service.spec?.transports],
  )

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
            <Title>{renderBadgeWithValue('Service', service.metadata.name || 'Service')}</Title>
          </TitleAndExpandCollapse>
          <div>
            <CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </TitleAndControlsRow>
        <OverflowContainer>
          <SpecGrid>
            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderNamespaceBadgeWithValue(service.metadata.namespace)}</div>

            <Typography.Text type="secondary">Display Name</Typography.Text>
            <div>{renderValue(service.spec?.displayName)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(service.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(service.spec?.comment)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{renderTimestampWithIcon(service.metadata.creationTimestamp)}</div>

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
            <Subtitle>Transports</Subtitle>
          </SubtitleWithIcon>
          <TagsContainer>
            {transportDetails.length > 0 ? transportDetails : <InfoTag>No transports</InfoTag>}
          </TagsContainer>

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
          {isServiceBindingsLoading || isAddressGroupsLoading ? (
            <Spin />
          ) : (
            <TreeContainer>
              <Tree
                showLine
                switcherIcon={<CaretDownOutlined />}
                defaultExpandedKeys={boundAddressGroups.treeData.map(node => String(node.key))}
                treeData={boundAddressGroups.treeData}
              />
            </TreeContainer>
          )}
        </OverflowContainer>
      </CustomCard>
    </VerboseContainer>
  )
}
