import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { EditFilled, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { patchEntryWithReplaceOp, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { useQueryClient } from '@tanstack/react-query'
import { TAddressGroupResource, TServiceBindingResource, TServiceResource } from 'localTypes'
import { syncAddressGroupBindings } from 'components/organisms/Services/molecules/ServiceFormModal/utils'
import { OPENAPI_UI_BASEPREFIX } from 'utils/runtimeConfig'
import {
  buildNamespacedValue,
  getAddressGroupOptions,
  getApiEndpoint,
  renderBadge,
  renderTimestampWithIcon,
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

const isBindingForService = (binding: TServiceBindingResource, serviceName: string, serviceNamespace: string) =>
  binding.spec?.service?.name === serviceName && binding.spec?.service?.namespace === serviceNamespace

type TIncomingPortRow = {
  key: string
  port: string
  protocol: string
  description: string
}

const buildIncomingPortRows = (service: TServiceDetailsResource): TIncomingPortRow[] =>
  (service.spec?.transports || []).flatMap((transport, transportIndex) =>
    (transport.entries || []).map((entry, entryIndex) => ({
      key: `${transportIndex}-${entryIndex}`,
      port: entry.ports || (entry.types?.length ? entry.types.join(', ') : EMPTY_VALUE),
      protocol: transport.protocol || EMPTY_VALUE,
      description: entry.description || EMPTY_VALUE,
    })),
  )

const incomingPortsColumns: ColumnsType<TIncomingPortRow> = [
  {
    title: 'Port',
    dataIndex: 'port',
    key: 'port',
    width: 120,
    sorter: (a, b) => a.port.localeCompare(b.port, undefined, { numeric: true, sensitivity: 'base' }),
  },
  {
    title: 'Protocol',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 120,
    sorter: (a, b) => a.protocol.localeCompare(b.protocol, undefined, { numeric: true, sensitivity: 'base' }),
    render: value => (value === EMPTY_VALUE ? value : <Tag>{value}</Tag>),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    sorter: (a, b) => a.description.localeCompare(b.description, undefined, { numeric: true, sensitivity: 'base' }),
  },
]

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
      maskClosable={false}
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
  const incomingPortRows = useMemo(() => (service ? buildIncomingPortRows(service) : []), [service])
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
          <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Info</Typography.Text>
            <Flex gap={16} wrap="wrap">
              <Flex gap={4} style={{ flex: '1 1 140px' }} vertical>
                <Typography.Text type="secondary">Created</Typography.Text>
                <Typography.Text>{renderTimestampWithIcon(service.metadata.creationTimestamp)}</Typography.Text>
              </Flex>
              <Flex gap={4} style={{ flex: '1 1 180px', minWidth: 0 }} vertical>
                <Typography.Text type="secondary">Tenant</Typography.Text>
                <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                  {renderBadge('Tenant')}
                  <Typography.Link href={namespaceHref} style={{ minWidth: 0 }} ellipsis>
                    {data.namespace}
                  </Typography.Link>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
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
          <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Main</Typography.Text>
            <Flex gap={24} vertical>
              <DetailField label="Description" align="flex-start">
                <Typography.Paragraph style={{ margin: 0 }}>
                  {renderValue(service.spec?.description)}
                </Typography.Paragraph>
              </DetailField>

              <DetailField label="Comment" align="flex-start">
                <Typography.Paragraph style={{ margin: 0 }}>{renderValue(service.spec?.comment)}</Typography.Paragraph>
              </DetailField>
            </Flex>
          </Card>

          <Card styles={cardStyles} style={{ flex: '1 1 460px' }}>
            <Typography.Text style={sectionTitleStyle}>Incoming ports</Typography.Text>
            <Table<TIncomingPortRow>
              columns={incomingPortsColumns}
              dataSource={incomingPortRows}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No incoming ports" /> }}
              pagination={false}
              rowKey="key"
              size="middle"
            />
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
