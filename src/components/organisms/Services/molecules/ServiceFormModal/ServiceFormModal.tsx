import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Form, Input, message, Modal, Segmented, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { createNewEntry, TSingleResource, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
} from 'localTypes'
import {
  API_GROUP,
  API_RESOURCE_VERSION,
  API_VERSION,
  buildNamespacedValue,
  getAddressGroupOptions,
  getApiEndpoint,
  getNamespaceOptions,
  IPV_OPTIONS,
  NAME_PATTERN,
  normalizeOptionalString,
  PORT_VALUE_SEPARATOR,
  PROTOCOL_OPTIONS,
  renderBadgeWithValue,
  validatePortToken,
} from 'utils'
import { TServiceResource } from '../../tableConfig'
import { buildServiceTransports, flattenServiceTransports } from './transportUtils'
import { TServiceFormModalProps, TServiceFormValues } from './types'
import { buildCurrentBindings, buildOverviewTreeData, patchEditableSpec, syncAddressGroupBindings } from './utils'
import { Styled } from './styled'

const DISPLAY_NAME_MAX_LENGTH = 63
const IPV_VALUES = IPV_OPTIONS.map(option => option.value)
const PROTOCOL_VALUES = PROTOCOL_OPTIONS.map(option => option.value)
const isIpFamilyValue = (value?: string) => !value || IPV_VALUES.some(optionValue => optionValue === value)
const isProtocolValue = (value?: string) => !value || PROTOCOL_VALUES.some(optionValue => optionValue === value)
const isAntdValidationError = (error: unknown) => Boolean(error && typeof error === 'object' && 'errorFields' in error)

export const ServiceFormModal: FC<TServiceFormModalProps> = ({ cluster, namespace, open, service, onClose }) => {
  const [form] = Form.useForm<TServiceFormValues>()
  const [activeTab, setActiveTab] = useState<'info' | 'ports'>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const formValues = Form.useWatch([], form) as TServiceFormValues | undefined
  const selectedAddressGroups = useMemo(() => formValues?.addressGroups || [], [formValues?.addressGroups])
  const isEditMode = Boolean(service)

  const {
    data: tenantsData,
    isLoading: isTenantsLoading,
    error: tenantsError,
  } = useK8sSmartResource<{ items: TSingleResource[] }>({
    cluster,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'tenants',
    isEnabled: open,
  })

  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useK8sSmartResource<{ items: TAddressGroupResource[] }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'addressgroups',
    isEnabled: open,
  })

  const { data: hostBindingsData, isLoading: isHostBindingsLoading } = useK8sSmartResource<{
    items: THostBindingResource[]
  }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'hostbindings',
    isEnabled: open,
  })

  const { data: serviceBindingsData, isLoading: isServiceBindingsLoading } = useK8sSmartResource<{
    items: TServiceBindingResource[]
  }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'servicebindings',
    isEnabled: open,
  })

  const { data: networkBindingsData, isLoading: isNetworkBindingsLoading } = useK8sSmartResource<{
    items: TNetworkBindingResource[]
  }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'networkbindings',
    isEnabled: open,
  })

  const { data: hostsData, isLoading: isHostsLoading } = useK8sSmartResource<{ items: THostResource[] }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'hosts',
    isEnabled: open,
  })

  const { data: servicesData, isLoading: isServicesLoading } = useK8sSmartResource<{ items: TServiceResource[] }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'services',
    isEnabled: open,
  })

  const { data: networksData, isLoading: isNetworksLoading } = useK8sSmartResource<{ items: TNetworkResource[] }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'networks',
    isEnabled: open,
  })

  const namespaceOptions = useMemo(() => getNamespaceOptions(tenantsData?.items), [tenantsData?.items])
  const addressGroupOptions = useMemo(
    () => getAddressGroupOptions(addressGroupsData?.items),
    [addressGroupsData?.items],
  )
  const currentBindings = useMemo(
    () => buildCurrentBindings(service, serviceBindingsData?.items),
    [service, serviceBindingsData?.items],
  )
  const overviewTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildOverviewTreeData({
        addressGroups: addressGroupsData?.items,
        selectedAddressGroupValues: selectedAddressGroups,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
      }),
    [
      addressGroupsData?.items,
      hostBindingsData?.items,
      hostsData?.items,
      networkBindingsData?.items,
      networksData?.items,
      selectedAddressGroups,
      serviceBindingsData?.items,
      servicesData?.items,
    ],
  )
  const isOverviewLoading =
    isAddressGroupsLoading ||
    isHostBindingsLoading ||
    isNetworkBindingsLoading ||
    isServiceBindingsLoading ||
    isHostsLoading ||
    isNetworksLoading ||
    isServicesLoading
  const isFormResourcesLoading = isTenantsLoading || isOverviewLoading
  const isInitialLoadPending = open && !isInitialized
  const isModalInitializing = isFormResourcesLoading || isInitialLoadPending

  useEffect(() => {
    if (!open) {
      didApplyEditPrefillRef.current = false
      didApplyCreatePrefillRef.current = false
      setIsInitialized(false)
      return
    }

    if (service && !isFormResourcesLoading && !didApplyEditPrefillRef.current) {
      didApplyEditPrefillRef.current = true
      form.setFieldsValue({
        namespace: service.metadata.namespace || namespace,
        name: service.metadata.name,
        displayName: service.spec?.displayName,
        description: service.spec?.description,
        comment: service.spec?.comment,
        addressGroups: currentBindings
          .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
          .filter((value): value is string => Boolean(value)),
        transportEntries: flattenServiceTransports(service.spec?.transports),
      })
      setIsInitialized(true)
      return
    }

    if (!service && !isFormResourcesLoading && !didApplyCreatePrefillRef.current) {
      didApplyCreatePrefillRef.current = true
      form.setFieldsValue({
        namespace,
        name: undefined,
        displayName: undefined,
        description: undefined,
        comment: undefined,
        addressGroups: [],
        transportEntries: [],
      })
      setIsInitialized(true)
    }
  }, [currentBindings, form, isFormResourcesLoading, namespace, open, service])

  useEffect(() => {
    if (open) {
      return
    }

    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    setActiveTab('info')
    setIsSubmitting(false)
    form.resetFields()
  }, [form, open])

  const handleCancel = () => {
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    setActiveTab('info')
    setIsSubmitting(false)
    form.resetFields()
    onClose()
  }

  const handleSubmit = async () => {
    let values: TServiceFormValues

    try {
      await form.validateFields([
        ['namespace'],
        ['name'],
        ['displayName'],
        ['addressGroups'],
        ['description'],
        ['comment'],
        ['transportEntries'],
      ])
      values = form.getFieldsValue(true) as TServiceFormValues
    } catch (error) {
      if (isAntdValidationError(error)) {
        return
      }

      throw error
    }

    setIsSubmitting(true)

    try {
      const serviceIdentifier = {
        name: values.name,
        namespace: values.namespace,
      }
      const serviceBody = {
        apiVersion: service?.apiVersion || API_RESOURCE_VERSION,
        kind: service?.kind || 'Service',
        metadata: service
          ? {
              ...service.metadata,
              name: values.name,
              namespace: values.namespace,
            }
          : {
              name: values.name,
              namespace: values.namespace,
            },
        spec: Object.fromEntries(
          Object.entries({
            displayName: normalizeOptionalString(values.displayName),
            description: normalizeOptionalString(values.description),
            comment: normalizeOptionalString(values.comment),
            transports: buildServiceTransports(values.transportEntries),
          }).filter(([, value]) => {
            if (value === undefined || value === '') {
              return false
            }

            return !Array.isArray(value) || value.length > 0
          }),
        ),
      }

      if (service) {
        const serviceEndpoint = `${getApiEndpoint(cluster, values.namespace, 'services')}/${values.name}`
        const changedFieldsCount = await patchEditableSpec(serviceEndpoint, service, values)
        const changedBindingsCount = await syncAddressGroupBindings(cluster, serviceIdentifier, values, currentBindings)

        if (changedFieldsCount === 0 && changedBindingsCount === 0) {
          message.info('No changes to save')
          handleCancel()
          return
        }

        await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        message.success('Service updated')
        handleCancel()
        return
      }

      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'services'),
        body: serviceBody,
      })

      await syncAddressGroupBindings(cluster, serviceIdentifier, values, [])
      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      message.success('Service created')
      handleCancel()
    } catch (error) {
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} service: ${String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      afterClose={() => {
        didApplyEditPrefillRef.current = false
        didApplyCreatePrefillRef.current = false
        setIsInitialized(false)
        setActiveTab('info')
        setIsSubmitting(false)
        form.resetFields()
      }}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      width={1092}
      destroyOnHidden
    >
      <Styled.ModalContent>
        {isModalInitializing ? (
          <Styled.LoadingState>
            <Spin size="large" />
          </Styled.LoadingState>
        ) : (
          <>
            <Styled.FormColumn>
              <Styled.Header>{renderBadgeWithValue('Service', 'Service')}</Styled.Header>
              <Styled.SegmentedWrap>
                <Segmented
                  options={[
                    { label: 'Info', value: 'info' },
                    { label: 'Ports', value: 'ports' },
                  ]}
                  value={activeTab}
                  onChange={value => setActiveTab(value as 'info' | 'ports')}
                />
              </Styled.SegmentedWrap>
              <Form<TServiceFormValues> form={form} layout="vertical" requiredMark>
                <div style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
                  <Form.Item
                    name="namespace"
                    label="Namespace"
                    rules={[
                      { required: true, message: 'Select namespace' },
                      { pattern: NAME_PATTERN, message: 'Use a valid Kubernetes namespace name' },
                      { max: 63, message: 'Namespace must be 63 characters or less' },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select namespace"
                      options={namespaceOptions}
                      loading={isTenantsLoading}
                      disabled={isEditMode}
                      status={tenantsError ? 'error' : undefined}
                    />
                  </Form.Item>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                      { required: true, message: 'Enter name' },
                      { pattern: NAME_PATTERN, message: 'Use lowercase letters, numbers, and hyphens' },
                      { max: 63, message: 'Name must be 63 characters or less' },
                    ]}
                  >
                    <Input placeholder="e.g. h-api-prod-01" disabled={isEditMode} />
                  </Form.Item>
                  <Form.Item
                    name="displayName"
                    label="Display name"
                    rules={[{ max: DISPLAY_NAME_MAX_LENGTH, message: 'Display name must be 63 characters or less' }]}
                  >
                    <Input placeholder="e.g. api-gateway" />
                  </Form.Item>
                  <Form.Item
                    name="addressGroups"
                    label="Address group"
                    validateStatus={addressGroupsError ? 'error' : undefined}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Select address groups"
                      optionFilterProp="searchText"
                      options={addressGroupOptions}
                      loading={isAddressGroupsLoading}
                    />
                  </Form.Item>
                  <Form.Item name="description" label="Description">
                    <Input placeholder="Briefly describe the service's purpose" />
                  </Form.Item>
                  <Form.Item name="comment" label="Comment">
                    <Input.TextArea
                      placeholder="Add any additional notes here..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                </div>
                <div style={{ display: activeTab === 'ports' ? 'block' : 'none' }}>
                  <Form.List name="transportEntries">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.length === 0 ? (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transport entries" />
                        ) : null}
                        {fields.map(field => {
                          const protocol = form.getFieldValue(['transportEntries', field.name, 'protocol']) as
                            | 'TCP'
                            | 'UDP'
                            | 'ICMP'
                            | undefined

                          return (
                            <div
                              key={field.key}
                              style={{
                                marginBottom: 12,
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                borderRadius: 8,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 16px',
                                  background: 'rgba(0, 0, 0, 0.02)',
                                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                                }}
                              >
                                <span>Port {field.name + 1}</span>
                                <Button
                                  type="text"
                                  icon={<MinusOutlined />}
                                  onClick={() => remove(field.name)}
                                  aria-label={`Remove transport entry ${field.name + 1}`}
                                />
                              </div>
                              <div style={{ padding: 16 }}>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'IPv']}
                                  label="IP family"
                                  rules={[
                                    { required: true, message: 'Select IP family' },
                                    {
                                      validator: async (_, value?: string) => {
                                        if (isIpFamilyValue(value)) {
                                          return
                                        }

                                        throw new Error('Use IPv4 or IPv6')
                                      },
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Select IP family"
                                    options={IPV_OPTIONS as unknown as { label: string; value: string }[]}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'protocol']}
                                  label="Protocol"
                                  rules={[
                                    { required: true, message: 'Select protocol' },
                                    {
                                      validator: async (_, value?: string) => {
                                        if (isProtocolValue(value)) {
                                          return
                                        }

                                        throw new Error('Use TCP, UDP, or ICMP')
                                      },
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Select protocol"
                                    options={PROTOCOL_OPTIONS as unknown as { label: string; value: string }[]}
                                    onChange={value => {
                                      if (value === 'ICMP') {
                                        form.setFieldValue(['transportEntries', field.name, 'ports'], undefined)
                                      } else {
                                        form.setFieldValue(['transportEntries', field.name, 'types'], undefined)
                                      }
                                    }}
                                  />
                                </Form.Item>
                                {protocol === 'ICMP' ? (
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'types']}
                                    label="ICMP types"
                                    rules={[
                                      {
                                        validator: async (_, value?: string[]) => {
                                          const invalidValue = (value || []).find(item => {
                                            const parsedValue = Number(String(item).trim())

                                            return (
                                              !Number.isInteger(parsedValue) || parsedValue < 0 || parsedValue > 255
                                            )
                                          })

                                          if (invalidValue !== undefined) {
                                            throw new Error('Use ICMP types from 0 to 255')
                                          }
                                        },
                                      },
                                    ]}
                                  >
                                    <Select mode="tags" placeholder="e.g. 8, 0" tokenSeparators={[',', ' ']} />
                                  </Form.Item>
                                ) : (
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'ports']}
                                    label="Port"
                                    rules={[
                                      {
                                        validator: async (_, value?: string) => {
                                          if (!protocol) {
                                            return
                                          }

                                          const normalizedValue = normalizeOptionalString(value)

                                          if (!normalizedValue) {
                                            throw new Error('Enter port or port ranges')
                                          }

                                          const isValid = normalizedValue
                                            .split(PORT_VALUE_SEPARATOR)
                                            .every(token => validatePortToken(token.trim()))

                                          if (!isValid) {
                                            throw new Error('Use ports like 80,443 or ranges like 1000-2000')
                                          }
                                        },
                                      },
                                    ]}
                                  >
                                    <Input placeholder="e.g. 443 or 5000-6000, 6500" />
                                  </Form.Item>
                                )}
                                <Form.Item {...field} name={[field.name, 'description']} label="Description">
                                  <Input placeholder="Briefly describe this transport entry" />
                                </Form.Item>
                                <Form.Item {...field} name={[field.name, 'comment']} label="Comment">
                                  <Input.TextArea
                                    placeholder="Add any additional notes here..."
                                    autoSize={{ minRows: 2, maxRows: 4 }}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          )
                        })}
                        <Styled.PortsActions>
                          <Button
                            type="dashed"
                            onClick={() =>
                              add({
                                IPv: 'IPv4',
                                protocol: 'TCP',
                              })
                            }
                          >
                            <PlusOutlined />
                            Add transport entry
                          </Button>
                        </Styled.PortsActions>
                      </>
                    )}
                  </Form.List>
                </div>
              </Form>
            </Styled.FormColumn>
            <Styled.Overview>
              <Styled.OverviewTitle>Structure Overview</Styled.OverviewTitle>
              <Styled.OverviewBody>
                {isOverviewLoading && <Spin />}
                {!isOverviewLoading && selectedAddressGroups.length === 0 && (
                  <Styled.OverviewEmpty>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                  </Styled.OverviewEmpty>
                )}
                {!isOverviewLoading && selectedAddressGroups.length > 0 && (
                  <Styled.TreeContainer>
                    <Tree showLine switcherIcon={<CaretDownOutlined />} defaultExpandAll treeData={overviewTreeData} />
                  </Styled.TreeContainer>
                )}
              </Styled.OverviewBody>
            </Styled.Overview>
          </>
        )}
      </Styled.ModalContent>
    </Modal>
  )
}
