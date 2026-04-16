import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import {
  CloseOutlined,
  CompressOutlined,
  CopyOutlined,
  DownOutlined,
  ExpandOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { message, Typography } from 'antd'
import { THostRow, formatDateTime, formatMapEntries } from './tableConfig'
import { Styled } from './styled'

type TVerboseHostPanelProps = {
  host: THostRow
  width?: number
  onClose: () => void
  onExpand: () => void
  onCollapse: () => void
}

const renderValue = (value?: string) => value || '-'

const MAX_VISIBLE_TAGS = 5

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
      <Styled.TagsContainer>
        {visibleValues.map(value => (
          <Styled.InfoTag
            key={value}
            style={{ cursor: onCopy ? 'pointer' : 'default' }}
            onClick={onCopy ? () => handleCopy(value) : undefined}
          >
            {onCopy && <CopyOutlined style={{ marginRight: 6 }} />}
            {value}
          </Styled.InfoTag>
        ))}
      </Styled.TagsContainer>
      {values.length > MAX_VISIBLE_TAGS && (
        <Styled.ViewMoreTag onClick={() => setExpanded(current => !current)}>
          Show {expanded ? 'less' : `more (${values.length - MAX_VISIBLE_TAGS})`}{' '}
          {expanded ? <UpOutlined /> : <DownOutlined />}
        </Styled.ViewMoreTag>
      )}
      {contextHolder}
    </>
  )
}

const renderTagList = (values: string[], onCopy?: boolean) => <TagList values={values} onCopy={onCopy} />

const renderRefs = (host: THostRow) => {
  if (!host.refs || host.refs.length === 0) {
    return <Typography.Text type="secondary">No related refs</Typography.Text>
  }

  const values = host.refs.map(ref => `${ref.kind || 'Unknown kind'} / ${ref.namespace || '-'} / ${ref.name || '-'}`)

  return renderTagList(values)
}

export const VerboseHostPanel: FC<TVerboseHostPanelProps> = ({ host, width, onClose, onExpand, onCollapse }) => {
  const titleRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const labels = useMemo(() => formatMapEntries(host.metadata.labels), [host.metadata.labels])
  const annotations = useMemo(() => formatMapEntries(host.metadata.annotations), [host.metadata.annotations])

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
            <Styled.Title>{host.metadata.name || 'Host'}</Styled.Title>
          </Styled.TitleAndExpandCollapse>
          <div>
            <Styled.CloseButton type="text" onClick={onClose} icon={<CloseOutlined />} />
          </div>
        </Styled.TitleAndControlsRow>
        <Styled.OverflowContainer $height={height}>
          <Styled.SpecGridHosts>
            <Typography.Text type="secondary">Name</Typography.Text>
            <div>{renderValue(host.metadata.name)}</div>

            <Typography.Text type="secondary">Namespace</Typography.Text>
            <div>{renderValue(host.metadata.namespace)}</div>

            <Typography.Text type="secondary">Display Name</Typography.Text>
            <div>{renderValue(host.spec?.displayName)}</div>

            <Typography.Text type="secondary">Description</Typography.Text>
            <div>{renderValue(host.spec?.description)}</div>

            <Typography.Text type="secondary">Comment</Typography.Text>
            <div>{renderValue(host.spec?.comment)}</div>

            <Typography.Text type="secondary">Host Name</Typography.Text>
            <div>{renderValue(host.metaInfo?.hostName)}</div>

            <Typography.Text type="secondary">OS</Typography.Text>
            <div>{renderValue(host.metaInfo?.os)}</div>

            <Typography.Text type="secondary">Platform</Typography.Text>
            <div>{renderValue(host.metaInfo?.platform)}</div>

            <Typography.Text type="secondary">Platform Family</Typography.Text>
            <div>{renderValue(host.metaInfo?.platformFamily)}</div>

            <Typography.Text type="secondary">Platform Version</Typography.Text>
            <div>{renderValue(host.metaInfo?.platformVersion)}</div>

            <Typography.Text type="secondary">Kernel Version</Typography.Text>
            <div>{renderValue(host.metaInfo?.kernelVersion)}</div>

            <Typography.Text type="secondary">IPv4</Typography.Text>
            <div>{renderTagList(host.ips?.IPv4 || [], true)}</div>

            <Typography.Text type="secondary">IPv6</Typography.Text>
            <div>{renderTagList(host.ips?.IPv6 || [], true)}</div>

            <Typography.Text type="secondary">Created</Typography.Text>
            <div>{formatDateTime(host.metadata.creationTimestamp)}</div>

            <Typography.Text type="secondary">Labels</Typography.Text>
            <div>{renderTagList(labels)}</div>

            <Typography.Text type="secondary">Annotations</Typography.Text>
            <div>{renderTagList(annotations)}</div>

            <Typography.Text type="secondary">Related Refs</Typography.Text>
            <div>{renderRefs(host)}</div>
          </Styled.SpecGridHosts>
        </Styled.OverflowContainer>
      </Styled.CustomCard>
    </Styled.VerboseContainer>
  )
}
