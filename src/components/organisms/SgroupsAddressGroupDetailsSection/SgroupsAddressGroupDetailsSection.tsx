import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { CopyOutlined, EditFilled, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Form, Input, Modal, Select, Spin, Tooltip, Typography, message } from 'antd'
import { patchEntryWithReplaceOp, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { useQueryClient } from '@tanstack/react-query'
import {
  TAddressGroupResource,
  THostBindingResource,
  TNetworkBindingResource,
  TServiceBindingResource,
} from 'localTypes'
import { OPENAPI_UI_BASEPREFIX } from 'utils/runtimeConfig'
import { getApiEndpoint, renderBadge, renderBadgeWithValue, renderTimestampWithIcon } from 'utils'
import { AddressGroupFormModal } from 'components/organisms/AddressGroups/molecules'

export type TSgroupsAddressGroupDetailsSectionData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsAddressGroupDetailsSectionProps = {
  data: TSgroupsAddressGroupDetailsSectionData
}

type TAddressGroupDetailsResource = TAddressGroupResource & {
  metadata: TAddressGroupResource['metadata'] & {
    ownerReferences?: Array<{
      kind?: string
      name?: string
    }>
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
  marginBottom: 12,
}

const cardStyles = {
  body: { padding: 16 },
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

const CountChip: FC<{ text: string; editable?: boolean; onClick?: () => void }> = ({ text, editable, onClick }) => (
  <Button
    icon={editable ? <EditFilled /> : undefined}
    iconPosition="end"
    style={{ background: 'rgba(0, 0, 0, 0.04)', borderColor: 'transparent' }}
    onClick={onClick}
  >
    {text}
  </Button>
)

const renderOwnerRefs = (ownerReferences?: TAddressGroupDetailsResource['metadata']['ownerReferences']) => {
  if (!ownerReferences?.length) {
    return <Typography.Text type="secondary">-</Typography.Text>
  }

  const [firstOwnerRef, ...restOwnerRefs] = ownerReferences

  return (
    <Flex align="center" gap={6} style={{ minWidth: 0 }}>
      {renderBadgeWithValue(firstOwnerRef.kind || 'OwnerRef', firstOwnerRef.name)}
      {restOwnerRefs.length > 0 && <Typography.Text type="secondary">+{restOwnerRefs.length}</Typography.Text>}
    </Flex>
  )
}

const isHostBindingForAddressGroup = (
  binding: THostBindingResource,
  addressGroupName: string,
  addressGroupNamespace: string,
) => {
  const addressGroupRef = binding.spec?.addressGroup
  const bindingAddressGroupNamespace = addressGroupRef?.namespace || binding.metadata.namespace

  return addressGroupRef?.name === addressGroupName && bindingAddressGroupNamespace === addressGroupNamespace
}

const isNetworkBindingForAddressGroup = (
  binding: TNetworkBindingResource,
  addressGroupName: string,
  addressGroupNamespace: string,
) => {
  const addressGroupRef = binding.spec?.addressGroup
  const bindingAddressGroupNamespace = addressGroupRef?.namespace || binding.metadata.namespace

  return addressGroupRef?.name === addressGroupName && bindingAddressGroupNamespace === addressGroupNamespace
}

const isServiceBindingForAddressGroup = (
  binding: TServiceBindingResource,
  addressGroupName: string,
  addressGroupNamespace: string,
) =>
  binding.spec?.addressGroup?.name === addressGroupName && binding.spec.addressGroup.namespace === addressGroupNamespace

const MetadataLabelsModal: FC<{
  endpoint: string
  labels?: Record<string, string>
  open: boolean
  onClose: () => void
  onSuccess: () => void
}> = ({ endpoint, labels, open, onClose, onSuccess }) => {
  const [form] = Form.useForm<{ labels: string[] }>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ labels: Object.entries(labels || {}).map(([key, value]) => `${key}=${value}`) })
    }
  }, [form, labels, open])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const body = Object.fromEntries(
        (values.labels || []).map(label => {
          const [key, ...valueParts] = label.split('=')

          return [key, valueParts.join('=')]
        }),
      )

      setIsSubmitting(true)
      await patchEntryWithReplaceOp({ endpoint, pathToValue: '/metadata/labels', body })
      onSuccess()
      onClose()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }

      message.error(`Failed to update labels: ${String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Edit Labels"
      open={open}
      maskClosable={false}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText="Save"
      width={650}
      destroyOnHidden
    >
      <Form form={form}>
        <Form.Item
          name="labels"
          rules={[
            {
              validator: async (_, value?: string[]) => {
                if (
                  !value ||
                  (Array.isArray(value) &&
                    value.every(label => label.includes('=') && !label.startsWith('=') && label.trim() === label))
                ) {
                  return
                }

                throw new Error('Please enter key=value labels')
              },
            },
          ]}
        >
          <Select mode="tags" open={false} placeholder="Enter key=value" tokenSeparators={[' ']} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const MetadataAnnotationsModal: FC<{
  annotations?: Record<string, string>
  endpoint: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}> = ({ annotations, endpoint, open, onClose, onSuccess }) => {
  const [form] = Form.useForm<{ annotations: { key: string; value?: string }[] }>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        annotations: Object.entries(annotations || {}).map(([key, value]) => ({ key, value })),
      })
    }
  }, [annotations, form, open])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const body = Object.fromEntries((values.annotations || []).map(item => [item.key, item.value || '']))

      setIsSubmitting(true)
      await patchEntryWithReplaceOp({ endpoint, pathToValue: '/metadata/annotations', body })
      onSuccess()
      onClose()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }

      message.error(`Failed to update annotations: ${String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Edit Annotations"
      open={open}
      maskClosable={false}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText="Save"
      width={800}
      destroyOnHidden
    >
      <Form form={form}>
        <Form.List name="annotations">
          {(fields, { add, remove }) => (
            <Flex gap={12} vertical>
              {fields.map(({ key, ...field }) => (
                <Flex key={key} align="flex-start" gap={8}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'key']}
                    rules={[{ required: true, message: 'Key is required' }]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input placeholder="key" />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'value']} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="value" />
                  </Form.Item>
                  <Button icon={<MinusOutlined />} type="text" onClick={() => remove(field.name)} />
                </Flex>
              ))}
              <Button icon={<PlusOutlined />} type="dashed" onClick={() => add({})}>
                Add annotation
              </Button>
            </Flex>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}

export const SgroupsAddressGroupDetailsSection: FC<TSgroupsAddressGroupDetailsSectionProps> = ({ data }) => {
  const queryClient = useQueryClient()
  const [activeModal, setActiveModal] = useState<'assignments' | 'labels' | 'annotations' | null>(null)
  const {
    data: addressGroupData,
    isLoading: isAddressGroupLoading,
    error: addressGroupError,
  } = useK8sSmartResource<{ items?: TAddressGroupDetailsResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'addressgroups',
  })
  const {
    data: hostBindingsData,
    isLoading: isHostBindingsLoading,
    error: hostBindingsError,
  } = useK8sSmartResource<{ items?: THostBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId && data.namespace),
    namespace: data.namespace,
    plural: 'hostbindings',
  })
  const {
    data: networkBindingsData,
    isLoading: isNetworkBindingsLoading,
    error: networkBindingsError,
  } = useK8sSmartResource<{ items?: TNetworkBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId && data.namespace),
    namespace: data.namespace,
    plural: 'networkbindings',
  })
  const {
    data: serviceBindingsData,
    isLoading: isServiceBindingsLoading,
    error: serviceBindingsError,
  } = useK8sSmartResource<{ items?: TServiceBindingResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId),
    namespace: undefined,
    plural: 'servicebindings',
  })

  const addressGroup = addressGroupData?.items?.[0]
  const hostBindings = useMemo(
    () =>
      (hostBindingsData?.items || []).filter(binding =>
        isHostBindingForAddressGroup(binding, data.name, data.namespace),
      ),
    [data.name, data.namespace, hostBindingsData?.items],
  )
  const networkBindings = useMemo(
    () =>
      (networkBindingsData?.items || []).filter(binding =>
        isNetworkBindingForAddressGroup(binding, data.name, data.namespace),
      ),
    [data.name, data.namespace, networkBindingsData?.items],
  )
  const serviceBindings = useMemo(
    () =>
      (serviceBindingsData?.items || []).filter(binding =>
        isServiceBindingForAddressGroup(binding, data.name, data.namespace),
      ),
    [data.name, data.namespace, serviceBindingsData?.items],
  )
  const labelsCount = Object.keys(addressGroup?.metadata.labels || {}).length
  const annotationsCount = Object.keys(addressGroup?.metadata.annotations || {}).length
  const assignmentsCount = hostBindings.length + networkBindings.length + serviceBindings.length
  const namespaceHref = `${OPENAPI_UI_BASEPREFIX}/${data.clusterId}/factory/namespace-details/v1/namespaces/${data.namespace}`
  const endpoint =
    addressGroup?.metadata.name && addressGroup.metadata.namespace
      ? `${getApiEndpoint(data.clusterId, addressGroup.metadata.namespace, 'addressgroups')}/${
          addressGroup.metadata.name
        }`
      : ''
  const handleMetadataModalSuccess = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
    queryClient.invalidateQueries({ queryKey: ['multi'] })
    message.success(description)
  }

  if (isAddressGroupLoading || isHostBindingsLoading || isNetworkBindingsLoading || isServiceBindingsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    )
  }

  if (addressGroupError || hostBindingsError || networkBindingsError || serviceBindingsError) {
    return <Alert type="error" message="Error while loading AddressGroup details" />
  }

  if (!addressGroup) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="AddressGroup was not found." />
  }

  return (
    <>
      <Flex gap={8} vertical>
        <Flex gap={8} wrap="wrap">
          <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Info</Typography.Text>
            <Flex gap={16} wrap="wrap">
              <Flex gap={4} style={{ flex: '1 1 140px' }} vertical>
                <Typography.Text type="secondary">Created</Typography.Text>
                <Typography.Text>{renderTimestampWithIcon(addressGroup.metadata.creationTimestamp)}</Typography.Text>
              </Flex>
              <Flex gap={4} style={{ flex: '1 1 180px', minWidth: 0 }} vertical>
                <Typography.Text type="secondary">Namespace</Typography.Text>
                <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                  {renderBadge('Tenant')}
                  <Typography.Link href={namespaceHref} style={{ minWidth: 0 }} ellipsis>
                    {data.namespace}
                  </Typography.Link>
                </Flex>
              </Flex>
              <Flex gap={4} style={{ flex: '1 1 180px', minWidth: 0 }} vertical>
                <Typography.Text type="secondary">OwnerRef</Typography.Text>
                {renderOwnerRefs(addressGroup.metadata.ownerReferences)}
              </Flex>
            </Flex>
          </Card>

          <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Assignments</Typography.Text>
            <Flex align="center" gap={8} wrap>
              <CountChip
                text={`${assignmentsCount} assignments`}
                editable
                onClick={() => setActiveModal('assignments')}
              />
              <CountChip text={`${labelsCount} labels`} editable onClick={() => setActiveModal('labels')} />
              <CountChip
                text={`${annotationsCount} annotations`}
                editable
                onClick={() => setActiveModal('annotations')}
              />
            </Flex>
          </Card>
        </Flex>

        <Card styles={cardStyles}>
          <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
          <Flex gap={24} vertical>
            <DetailField label="Name">
              <CopyableValue value={addressGroup.metadata.name} />
            </DetailField>
            <DetailField label="Display name">
              <Typography.Text>{renderValue(addressGroup.spec?.displayName)}</Typography.Text>
            </DetailField>
            <DetailField label="Default action">
              <Typography.Text>{renderValue(addressGroup.spec?.defaultAction)}</Typography.Text>
            </DetailField>
            <DetailField label="Description" align="flex-start">
              <Typography.Paragraph style={{ margin: 0 }}>
                {renderValue(addressGroup.spec?.description)}
              </Typography.Paragraph>
            </DetailField>
            <DetailField label="Comment" align="flex-start">
              <Typography.Paragraph style={{ margin: 0 }}>
                {renderValue(addressGroup.spec?.comment)}
              </Typography.Paragraph>
            </DetailField>
          </Flex>
        </Card>
      </Flex>
      <AddressGroupFormModal
        cluster={data.clusterId}
        namespace={data.namespace}
        addressGroup={addressGroup}
        open={activeModal === 'assignments'}
        onClose={() => setActiveModal(null)}
      />
      <MetadataLabelsModal
        open={activeModal === 'labels'}
        onClose={() => setActiveModal(null)}
        labels={addressGroup.metadata.labels}
        endpoint={endpoint}
        onSuccess={() => handleMetadataModalSuccess('Labels have been updated')}
      />
      <MetadataAnnotationsModal
        open={activeModal === 'annotations'}
        onClose={() => setActiveModal(null)}
        annotations={addressGroup.metadata.annotations}
        endpoint={endpoint}
        onSuccess={() => handleMetadataModalSuccess('Annotations have been updated')}
      />
    </>
  )
}
