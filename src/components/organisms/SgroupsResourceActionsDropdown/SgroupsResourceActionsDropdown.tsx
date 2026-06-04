import React, { FC, useEffect, useMemo, useState } from 'react'
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileTextOutlined,
  MinusOutlined,
  PlusOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Flex, Form, Input, MenuProps, Modal, Select, message } from 'antd'
import { patchEntryWithReplaceOp, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { TAddressGroupResource, THostResource, TNetworkResource, TServiceResource } from 'localTypes'
import { AddressGroupFormModal } from 'components/organisms/AddressGroups/molecules'
import { mapAddressGroupsToRows } from 'components/organisms/AddressGroups/tableConfig'
import { HostFormModal } from 'components/organisms/Hosts/molecules'
import { mapHostsToRows } from 'components/organisms/Hosts/tableConfig'
import { NetworkFormModal } from 'components/organisms/Networks/molecules'
import { mapNetworksToRows } from 'components/organisms/Networks/tableConfig'
import { UniRuleFormModal } from 'components/organisms/Rules/molecules'
import { mapRulesToRows, TRuleResource } from 'components/organisms/Rules/tableConfig'
import { ServiceFormModal } from 'components/organisms/Services/molecules'
import { mapServicesToRows } from 'components/organisms/Services/tableConfig'
import { getDeleteModalResource, TDeleteModalResource } from 'utils'
import { SgroupsDeleteModal } from 'utils/SgroupsDeleteModal'

export type TSgroupsResourceActionsDropdownData = {
  clusterId: string
  endpoint: string
  kind: string
  name: string
  namespace: string
  plural: 'addressgroups' | 'hosts' | 'networks' | 'rules' | 'services'
}

type TSgroupsResourceActionsDropdownProps = {
  data: TSgroupsResourceActionsDropdownData
}

type TResource = TAddressGroupResource | THostResource | TNetworkResource | TRuleResource | TServiceResource
type TActiveModal = 'edit' | 'labels' | 'annotations' | null

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

export const SgroupsResourceActionsDropdown: FC<TSgroupsResourceActionsDropdownProps> = ({ data }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeModal, setActiveModal] = useState<TActiveModal>(null)
  const [deletingResource, setDeletingResource] = useState<TDeleteModalResource | null>(null)
  const { data: resourceData, isLoading } = useK8sSmartResource<{ items?: TResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: data.clusterId,
    fieldSelector: `metadata.name=${data.name}`,
    isEnabled: Boolean(data.clusterId && data.namespace && data.name),
    namespace: data.namespace,
    plural: data.plural,
  })
  const resource = resourceData?.items?.[0]
  const addressGroup = useMemo(() => {
    if (data.plural !== 'addressgroups' || !resource) {
      return null
    }

    return mapAddressGroupsToRows([resource as TAddressGroupResource])[0]
  }, [data.plural, resource])
  const host = useMemo(
    () => (data.plural === 'hosts' && resource ? mapHostsToRows([resource as THostResource])[0] : null),
    [data.plural, resource],
  )
  const network = useMemo(
    () => (data.plural === 'networks' && resource ? mapNetworksToRows([resource as TNetworkResource])[0] : null),
    [data.plural, resource],
  )
  const rule = useMemo(
    () => (data.plural === 'rules' && resource ? mapRulesToRows([resource as TRuleResource])[0] : null),
    [data.plural, resource],
  )
  const service = useMemo(
    () => (data.plural === 'services' && resource ? mapServicesToRows([resource as TServiceResource])[0] : null),
    [data.plural, resource],
  )
  const rowResource = addressGroup || host || network || rule || service
  const closeModal = () => setActiveModal(null)
  const handleMetadataModalSuccess = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
    queryClient.invalidateQueries({ queryKey: ['multi'] })
    message.success(description)
  }
  const handleDelete = () => {
    if (!rowResource) {
      message.error(`${data.kind} is not loaded yet.`)
      return
    }

    setDeletingResource(getDeleteModalResource(data.clusterId, data.namespace, data.plural, rowResource))
  }
  const items: MenuProps['items'] = [
    ...(data.plural === 'hosts' ? [{ key: 'sockstats', icon: <FileTextOutlined />, label: 'Socket Stats' }] : []),
    { key: 'edit', icon: <EditOutlined />, label: `Edit ${data.kind}` },
    { key: 'labels', icon: <TagsOutlined />, label: 'Edit Labels' },
    { key: 'annotations', icon: <FileTextOutlined />, label: 'Edit Annotations' },
    { type: 'divider' },
    { key: 'delete', danger: true, icon: <DeleteOutlined />, label: 'Delete' },
  ]

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => {
            if (key === 'sockstats') {
              navigate({ hash: 'sockstats' })
              return
            }

            if (key === 'delete') {
              handleDelete()
              return
            }

            setActiveModal(key as TActiveModal)
          },
        }}
        trigger={['click']}
      >
        <Button loading={isLoading}>
          Actions <DownOutlined />
        </Button>
      </Dropdown>

      {addressGroup && (
        <AddressGroupFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          addressGroup={addressGroup}
          open={activeModal === 'edit'}
          onClose={closeModal}
        />
      )}
      {host && (
        <HostFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          host={host}
          open={activeModal === 'edit'}
          onClose={closeModal}
        />
      )}
      {network && (
        <NetworkFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          network={network}
          open={activeModal === 'edit'}
          onClose={closeModal}
        />
      )}
      {rule && (
        <UniRuleFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          rule={rule}
          open={activeModal === 'edit'}
          onClose={closeModal}
        />
      )}
      {service && (
        <ServiceFormModal
          cluster={data.clusterId}
          namespace={data.namespace}
          service={service}
          open={activeModal === 'edit'}
          onClose={closeModal}
        />
      )}
      <MetadataLabelsModal
        open={activeModal === 'labels'}
        onClose={closeModal}
        labels={resource?.metadata.labels}
        endpoint={data.endpoint}
        onSuccess={() => handleMetadataModalSuccess('Labels have been updated')}
      />
      <MetadataAnnotationsModal
        open={activeModal === 'annotations'}
        onClose={closeModal}
        annotations={resource?.metadata.annotations}
        endpoint={data.endpoint}
        onSuccess={() => handleMetadataModalSuccess('Annotations have been updated')}
      />
      {deletingResource && (
        <SgroupsDeleteModal
          title={deletingResource.title}
          endpoint={deletingResource.endpoint}
          onClose={() => setDeletingResource(null)}
        />
      )}
    </>
  )
}
