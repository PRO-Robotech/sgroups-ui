import React, { FC, ReactNode } from 'react'
import { CopyOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Spin, Tooltip, Typography, message } from 'antd'
import { useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TNetworkResource } from 'localTypes'

export type TSgroupsNetworkDetailsSectionData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsNetworkDetailsSectionProps = {
  data: TSgroupsNetworkDetailsSectionData
}

type TNetworkDetailsResource = TNetworkResource & {
  metadata: TNetworkResource['metadata'] & {
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
  if (!value) return

  try {
    await navigator.clipboard.writeText(value)
    message.success(`Copied: ${value}`)
  } catch {
    message.error('Failed to copy text')
  }
}

const DetailField: FC<{ label: string; children: ReactNode; align?: 'center' | 'flex-start' }> = ({
  label,
  children,
  align = 'center',
}) => (
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

export const SgroupsNetworkDetailsSection: FC<TSgroupsNetworkDetailsSectionProps> = ({ data }) => {
  const {
    data: networkData,
    isLoading: isNetworkLoading,
    error: networkError,
  } = useK8sSmartResource<{ items?: TNetworkDetailsResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'networks',
  })
  const network = networkData?.items?.[0]

  if (isNetworkLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    )
  }

  if (networkError) {
    return <Alert type="error" message="Error while loading Network details" />
  }

  if (!network) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Network was not found." />
  }

  return (
    <Flex gap={8} wrap="wrap">
      <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
        <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
        <Flex gap={24} vertical>
          <DetailField label="CIDR">
            <CopyableValue value={network.spec?.CIDR} />
          </DetailField>
          <DetailField label="Description" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(network.spec?.description)}</Typography.Paragraph>
          </DetailField>
          <DetailField label="Comment" align="flex-start">
            <Typography.Paragraph style={{ margin: 0 }}>{renderValue(network.spec?.comment)}</Typography.Paragraph>
          </DetailField>
        </Flex>
      </Card>
      <div style={{ flex: '1 1 460px' }} />
    </Flex>
  )
}
