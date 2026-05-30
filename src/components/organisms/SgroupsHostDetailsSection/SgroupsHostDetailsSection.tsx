import React, { FC, ReactNode } from 'react'
import { CopyOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Spin, Tooltip, Typography, message } from 'antd'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { THostResource } from 'localTypes'

export type TSgroupsHostDetailsSectionData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsHostDetailsSectionProps = {
  data: TSgroupsHostDetailsSectionData
}

type THostDetailsResource = THostResource & {
  metadata: THostResource['metadata'] & {
    uid?: string
  }
}

const EMPTY_VALUE = '-'

const fieldLabelStyle: React.CSSProperties = {
  flex: '0 0 140px',
  lineHeight: '22px',
}

const fieldValueStyle: React.CSSProperties = {
  lineHeight: '22px',
  minWidth: 0,
}

const ellipsisValueStyle: React.CSSProperties = {
  ...fieldValueStyle,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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

const copyToClipboard = async (value?: string) => {
  if (!value) {
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    message.success(`Copied: ${value}`)
  } catch {
    message.error('Failed to copy text')
  }
}

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

const CopyableValue: FC<{ value?: string }> = ({ value }) => (
  <Flex align="center" gap={8} style={{ minWidth: 0 }}>
    <Typography.Text style={ellipsisValueStyle}>{renderValue(value)}</Typography.Text>
    {value && (
      <Tooltip title="Copy">
        <Button
          aria-label={`Copy ${value}`}
          icon={<CopyOutlined />}
          size="small"
          type="text"
          onClick={() => copyToClipboard(value)}
        />
      </Tooltip>
    )}
  </Flex>
)

const SmallCountChip: FC<{ text: string }> = ({ text }) => (
  <span
    style={{
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.04)',
      borderRadius: 4,
      display: 'inline-flex',
      lineHeight: '22px',
      minHeight: 24,
      padding: '0 8px',
    }}
  >
    {text}
  </span>
)

export const SgroupsHostDetailsSection: FC<TSgroupsHostDetailsSectionProps> = ({ data }) => {
  const {
    data: hostData,
    isLoading: isHostLoading,
    error: hostError,
  } = useK8sSmartResource<{ items?: THostDetailsResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'hosts',
  })
  const host = hostData?.items?.[0]
  const metaInfo = host?.metaInfo || host?.spec?.metaInfo
  const ips = host?.ips || host?.spec?.IPs

  if (isHostLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    )
  }

  if (hostError) {
    return <Alert type="error" message="Error while loading Host details" />
  }

  if (!host) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Host was not found." />
  }

  return (
    <Flex gap={8} wrap="wrap">
      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
        <Flex gap={24} vertical>
          <Flex gap={8} vertical>
            <DetailField label="Hostname">
              <CopyableValue value={metaInfo?.hostName} />
            </DetailField>
            <DetailField label="UUID">
              <CopyableValue value={host.metadata.uid} />
            </DetailField>
          </Flex>

          <DetailField label="IP Addresses">
            <Flex align="center" gap={8} wrap>
              <SmallCountChip text={`${ips?.IPv4?.length || 0} IPv4`} />
              <SmallCountChip text={`${ips?.IPv6?.length || 0} IPv6`} />
            </Flex>
          </DetailField>

          <DetailField label="Description" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(host.spec?.description)}</Typography.Paragraph>
          </DetailField>

          <DetailField label="Comments" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(host.spec?.comment)}</Typography.Paragraph>
          </DetailField>
        </Flex>
      </Card>

      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Meta info</Typography.Text>
        <Flex gap={8} vertical>
          <DetailField label="Hostname">
            <Typography.Text>{renderValue(metaInfo?.hostName)}</Typography.Text>
          </DetailField>
          <DetailField label="OS">
            <Typography.Text>{renderValue(metaInfo?.os)}</Typography.Text>
          </DetailField>
          <DetailField label="Platform">
            <Typography.Text>{renderValue(metaInfo?.platform)}</Typography.Text>
          </DetailField>
          <DetailField label="PlatformVersion">
            <Typography.Text>{renderValue(metaInfo?.platformVersion)}</Typography.Text>
          </DetailField>
          <DetailField label="Kernel">
            <Typography.Text>{renderValue(metaInfo?.kernelVersion)}</Typography.Text>
          </DetailField>
          {metaInfo?.platformFamily && (
            <DetailField label="PlatformFamily">
              <Typography.Text>{metaInfo.platformFamily}</Typography.Text>
            </DetailField>
          )}
        </Flex>
      </Card>
    </Flex>
  )
}
