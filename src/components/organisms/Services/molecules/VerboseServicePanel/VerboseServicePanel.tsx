import React, { FC, useMemo, useState } from 'react'
import {
  ApartmentOutlined,
  CloseOutlined,
  CompressOutlined,
  DownOutlined,
  ExpandOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { Typography, theme as antdTheme } from 'antd'
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
  VerboseContainer,
  ViewMoreTag,
} from 'components/atoms'
import { formatDateTime, formatMapEntries } from 'utils'
import { TServiceRow, TServiceTransport, TServiceTransportEntry } from '../../tableConfig'

type TVerboseServicePanelProps = {
  service: TServiceRow
  width?: number
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

const MAX_VISIBLE_TAGS = 5

const renderValue = (value?: string) => value || '-'

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

const formatTransportEntry = (entry: TServiceTransportEntry, index: number) => {
  const parts = []

  if (entry.ports) {
    parts.push(`Ports: ${entry.ports}`)
  }

  if (entry.types && entry.types.length > 0) {
    parts.push(`Types: ${entry.types.join(', ')}`)
  }

  if (entry.description) {
    parts.push(`Description: ${entry.description}`)
  }

  if (entry.comment) {
    parts.push(`Comment: ${entry.comment}`)
  }

  return parts.join(' | ') || `Entry ${index + 1}`
}

const formatTransport = (transport: TServiceTransport, index: number) => {
  const headerParts = [transport.protocol, transport.IPv].filter(Boolean)
  const header = headerParts.length > 0 ? headerParts.join(' / ') : `Transport ${index + 1}`
  const entries = transport.entries?.map(formatTransportEntry) || []

  return entries.length > 0 ? [`${header}:`, ...entries.map(entry => `  ${entry}`)].join('\n') : `${header}: No entries`
}

const renderRefs = (service: TServiceRow) => {
  if (!service.refs || service.refs.length === 0) {
    return <Typography.Text type="secondary">No related refs</Typography.Text>
  }

  const values = service.refs.map(ref => `${ref.kind || 'Unknown kind'} / ${ref.namespace || '-'} / ${ref.name || '-'}`)

  return renderTagList(values)
}

export const VerboseServicePanel: FC<TVerboseServicePanelProps> = ({
  service,
  width,
  onClose,
  onExpand,
  onCollapse,
}) => {
  const { token } = antdTheme.useToken()
  const labels = useMemo(() => formatMapEntries(service.metadata.labels), [service.metadata.labels])
  const annotations = useMemo(() => formatMapEntries(service.metadata.annotations), [service.metadata.annotations])
  const transportDetails = useMemo(
    () => (service.spec?.transports || []).map(formatTransport),
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
            <Title>{service.metadata.name || 'Service'}</Title>
          </TitleAndExpandCollapse>
          <div>
            <CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </TitleAndControlsRow>
        <OverflowContainer>
          <SpecGrid>
            <Typography.Text type="secondary">Name</Typography.Text>
            <div>{renderValue(service.metadata.name)}</div>

            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderValue(service.metadata.namespace)}</div>

            <Typography.Text type="secondary">Display Name</Typography.Text>
            <div>{renderValue(service.spec?.displayName)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(service.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(service.spec?.comment)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{formatDateTime(service.metadata.creationTimestamp)}</div>

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
          <div>{renderTagList(transportDetails)}</div>

          <DividerLine $backgroundColor={token.colorBorder} />

          <SubtitleWithIcon>
            <Icon>
              <ApartmentOutlined />
            </Icon>
            <Subtitle>Related Refs</Subtitle>
          </SubtitleWithIcon>
          {renderRefs(service)}
        </OverflowContainer>
      </CustomCard>
    </VerboseContainer>
  )
}
