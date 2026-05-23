import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { CopyOutlined, EditFilled, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Flex, Form, Input, Modal, Select, Spin, Tooltip, Typography, message } from 'antd'
import { patchEntryWithReplaceOp, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { useQueryClient } from '@tanstack/react-query'
import { TAddressGroupResource, TServiceBindingResource, TServiceResource } from 'localTypes'
import { syncAddressGroupBindings } from 'components/organisms/Services/molecules/ServiceFormModal/utils'
import { OPENAPI_UI_BASEPREFIX } from 'utils/runtimeConfig'
import {
  buildNamespacedValue,
  formatDateTime,
  getAddressGroupOptions,
  getApiEndpoint,
  renderBadge,
  renderBadgeWithValue,
} from 'utils'

export type TSgroupsServiceDetailsSectionData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsServiceDetailsSectionProps = {
  data: TSgroupsServiceDetailsSectionData
}

type TServiceDetailsResource = TServiceResource & {
  metadata: TServiceResource['metadata'] & {
    ownerReferences?: Array<{
      kind?: string
      name?: string
    }>
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
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '24px',
  marginBottom: 16,
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

const isBindingForService = (binding: TServiceBindingResource, serviceName: string, serviceNamespace: string) =>
  binding.spec?.service?.name === serviceName && binding.spec?.service?.namespace === serviceNamespace

const renderOwnerRefs = (ownerReferences?: TServiceDetailsResource['metadata']['ownerReferences']) => {
  if (!ownerReferences?.length) return <Typography.Text type="secondary">-</Typography.Text>

  const [firstOwnerRef, ...restOwnerRefs] = ownerReferences

  return (
    <Flex align="center" gap={6} style={{ minWidth: 0 }}>
      {renderBadgeWithValue(firstOwnerRef.kind || 'OwnerRef', firstOwnerRef.name)}
      {restOwnerRefs.length > 0 && <Typography.Text type="secondary">+{restOwnerRefs.length}</Typography.Text>}
    </Flex>
  )
}

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
      if (error && typeof error === 'object' && 'errorFields' in error) return

      message.error(`Failed to update labels: ${String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Edit Labels"
      open={open}
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
      if (error && typeof error === 'object' && 'errorFields' in error) return

      message.error(`Failed to update annotations: ${String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Edit Annotations"
      open={open}
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

const ServiceAddressGroupsModal: FC<{
  clusterId: string
  service: TServiceDetailsResource
  currentBindings: TServiceBindingResource[]
  addressGroups?: TAddressGroupResource[]
  isLoading?: boolean
  open: boolean
  onClose: () => void
}> = ({ clusterId, service, currentBindings, addressGroups, isLoading, open, onClose }) => {
  const queryClient = useQueryClient()
  const [selectedAddressGroups, setSelectedAddressGroups] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const serviceName = service.metadata.name || ''
  const serviceNamespace = service.metadata.namespace || ''
  const addressGroupOptions = useMemo(
    () => getAddressGroupOptions(addressGroups, { showNamespace: true }),
    [addressGroups],
  )
  const initialAddressGroups = useMemo(
    () =>
      currentBindings
        .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
        .filter((value): value is string => Boolean(value)),
    [currentBindings],
  )

  useEffect(() => {
    if (open) setSelectedAddressGroups(initialAddressGroups)
  }, [initialAddressGroups, open])

  const handleSubmit = async () => {
    if (!serviceName || !serviceNamespace) {
      message.error('Service identifiers are missing.')
      return
    }

    setIsSubmitting(true)
    try {
      const changedCount = await syncAddressGroupBindings(
        clusterId,
        { name: serviceName, namespace: serviceNamespace },
        {
          namespace: serviceNamespace,
          name: serviceName,
          addressGroups: selectedAddressGroups,
          description: service.spec?.description,
          comment: service.spec?.comment,
          transportEntries: [],
        },
        currentBindings,
      )

      if (changedCount === 0) {
        message.info('No changes to save')
      } else {
        await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        await queryClient.invalidateQueries({ queryKey: ['multi'] })
        message.success('Address groups updated')
      }

      onClose()
    } catch (error) {
      message.error(`Failed to update address groups: ${String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title="Edit Address Groups"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText="Save"
      width={640}
      destroyOnHidden
    >
      <Select
        mode="multiple"
        showSearch
        optionFilterProp="searchText"
        options={addressGroupOptions}
        loading={isLoading}
        value={selectedAddressGroups}
        placeholder="Select address groups"
        style={{ width: '100%' }}
        onChange={setSelectedAddressGroups}
      />
    </Modal>
  )
}

const uniqueValues = (values: Array<string | undefined>) => [...new Set(values.filter(Boolean) as string[])]

const formatTransportDetails = (service: TServiceDetailsResource) => {
  const transports = service.spec?.transports || []
  const entries = transports.flatMap(transport =>
    (transport.entries || []).map(entry => {
      const parts = [transport.IPv, transport.protocol, entry.ports && `ports ${entry.ports}`].filter(Boolean)

      if (entry.types?.length) parts.push(`types ${entry.types.join(', ')}`)

      return parts.join(' / ') || EMPTY_VALUE
    }),
  )

  return entries.length > 0 ? entries.join('; ') : EMPTY_VALUE
}

export const SgroupsServiceDetailsSection: FC<TSgroupsServiceDetailsSectionProps> = ({ data }) => {
  const queryClient = useQueryClient()
  const [activeModal, setActiveModal] = useState<'addressGroups' | 'labels' | 'annotations' | null>(null)
  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useK8sSmartResource<{ items?: TServiceDetailsResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: 'services',
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
  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items?: TAddressGroupResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    isEnabled: Boolean(data.clusterId),
    namespace: undefined,
    plural: 'addressgroups',
  })

  const service = serviceData?.items?.[0]
  const transports = service?.spec?.transports || []
  const protocols = uniqueValues(transports.map(transport => transport.protocol))
  const ipFamilies = uniqueValues(transports.map(transport => transport.IPv))
  const entriesCount = transports.reduce((sum, transport) => sum + (transport.entries?.length || 0), 0)
  const labelsCount = Object.keys(service?.metadata.labels || {}).length
  const annotationsCount = Object.keys(service?.metadata.annotations || {}).length
  const currentBindings = useMemo(
    () => (serviceBindingsData?.items || []).filter(binding => isBindingForService(binding, data.name, data.namespace)),
    [data.name, data.namespace, serviceBindingsData?.items],
  )
  const addressGroupsCount = currentBindings.length
  const namespaceHref = `${OPENAPI_UI_BASEPREFIX}/${data.clusterId}/factory/namespace-details/v1/namespaces/${data.namespace}`
  const endpoint =
    service?.metadata.name && service.metadata.namespace
      ? `${getApiEndpoint(data.clusterId, service.metadata.namespace, 'services')}/${service.metadata.name}`
      : ''
  const handleMetadataModalSuccess = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
    queryClient.invalidateQueries({ queryKey: ['multi'] })
    message.success(description)
  }

  if (isServiceLoading || isServiceBindingsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    )
  }

  if (serviceError || serviceBindingsError || addressGroupsError) {
    return <Alert type="error" message="Error while loading Service details" />
  }

  if (!service) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Service was not found." />
  }

  return (
    <>
      <Flex gap={8} vertical>
        <Flex gap={8} wrap="wrap">
          <Card style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Info</Typography.Text>
            <Flex gap={16} wrap="wrap">
              <Flex gap={4} style={{ flex: '1 1 140px' }} vertical>
                <Typography.Text type="secondary">Created</Typography.Text>
                <Typography.Text>{formatDateTime(service.metadata.creationTimestamp)}</Typography.Text>
              </Flex>
              <Flex gap={4} style={{ flex: '1 1 180px', minWidth: 0 }} vertical>
                <Typography.Text type="secondary">Namespace</Typography.Text>
                <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                  {renderBadge('Namespace')}
                  <Typography.Link href={namespaceHref} style={{ minWidth: 0 }} ellipsis>
                    {data.namespace}
                  </Typography.Link>
                </Flex>
              </Flex>
              <Flex gap={4} style={{ flex: '1 1 180px', minWidth: 0 }} vertical>
                <Typography.Text type="secondary">OwnerRef</Typography.Text>
                {renderOwnerRefs(service.metadata.ownerReferences)}
              </Flex>
            </Flex>
          </Card>

          <Card style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Assignments</Typography.Text>
            <Flex align="center" gap={8} wrap>
              <CountChip
                text={`${addressGroupsCount} address groups`}
                editable
                onClick={() => setActiveModal('addressGroups')}
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

        <Flex gap={8} wrap="wrap">
          <Card style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
            <Flex gap={24} vertical>
              <Flex gap={8} vertical>
                <DetailField label="Service">
                  <CopyableValue value={service.metadata.name} />
                </DetailField>
                <DetailField label="UUID">
                  <CopyableValue value={service.metadata.uid} />
                </DetailField>
              </Flex>

              <DetailField label="Transports">
                <Flex align="center" gap={8} wrap>
                  <SmallCountChip text={`${transports.length} transports`} />
                  <SmallCountChip text={`${entriesCount} entries`} />
                </Flex>
              </DetailField>

              <DetailField label="Description" align="flex-start">
                <Typography.Paragraph style={{ margin: 0 }}>
                  {renderValue(service.spec?.description)}
                </Typography.Paragraph>
              </DetailField>

              <DetailField label="Comments" align="flex-start">
                <Typography.Paragraph style={{ margin: 0 }}>{renderValue(service.spec?.comment)}</Typography.Paragraph>
              </DetailField>
            </Flex>
          </Card>

          <Card style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Meta info</Typography.Text>
            <Flex gap={8} vertical>
              <DetailField label="Protocols">
                <Typography.Text>{protocols.length > 0 ? protocols.join(', ') : EMPTY_VALUE}</Typography.Text>
              </DetailField>
              <DetailField label="IP Families">
                <Typography.Text>{ipFamilies.length > 0 ? ipFamilies.join(', ') : EMPTY_VALUE}</Typography.Text>
              </DetailField>
              <DetailField label="Transport details" align="flex-start">
                <Typography.Paragraph style={{ margin: 0 }}>{formatTransportDetails(service)}</Typography.Paragraph>
              </DetailField>
            </Flex>
          </Card>
        </Flex>
      </Flex>
      <ServiceAddressGroupsModal
        clusterId={data.clusterId}
        service={service}
        currentBindings={currentBindings}
        addressGroups={addressGroupsData?.items}
        isLoading={isAddressGroupsLoading}
        open={activeModal === 'addressGroups'}
        onClose={() => setActiveModal(null)}
      />
      <MetadataLabelsModal
        open={activeModal === 'labels'}
        onClose={() => setActiveModal(null)}
        labels={service.metadata.labels}
        endpoint={endpoint}
        onSuccess={() => handleMetadataModalSuccess('Labels have been updated')}
      />
      <MetadataAnnotationsModal
        open={activeModal === 'annotations'}
        onClose={() => setActiveModal(null)}
        annotations={service.metadata.annotations}
        endpoint={endpoint}
        onSuccess={() => handleMetadataModalSuccess('Annotations have been updated')}
      />
    </>
  )
}
