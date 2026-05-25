import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Cascader, Empty, Form, Input, message, Modal, Segmented, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createNewEntry, TSingleResource, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { v4 as uuidv4 } from 'uuid'
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
  getAddressGroupCascaderOptions,
  getAddressGroupCascaderValue,
  getAddressGroupValuesFromCascader,
  getApiEndpoint,
  getNamespaceOptions,
  IPV_OPTIONS,
  NAME_PATTERN,
  normalizeOptionalString,
  PORT_VALUE_SEPARATOR,
  PROTOCOL_OPTIONS,
  EditableResourceTitle,
  renderBadgeWithValue,
  renderAddressGroupCascaderSelection,
  TAddressGroupCascaderOption,
  validateDisplayName,
  validatePortToken,
  withFallbackNamespace,
} from 'utils'
import { TServiceResource } from '../../tableConfig'
import { buildServiceTransports, flattenServiceTransports } from './transportUtils'
import { TServiceFormModalProps, TServiceFormValues } from './types'
import { buildCurrentBindings, buildOverviewTreeData, patchEditableSpec, syncAddressGroupBindings } from './utils'
import { Styled } from './styled'

const DISPLAY_NAME_MAX_LENGTH = 63
const CREATE_DISPLAY_NAME_PREFIX = 'services-'
const getCreateDisplayName = () => `${CREATE_DISPLAY_NAME_PREFIX}${Math.floor(100000 + Math.random() * 900000)}`
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
  const [addressGroupOptionsNamespace, setAddressGroupOptionsNamespace] = useState<string | undefined>()
  const [addressGroupsByNamespace, setAddressGroupsByNamespace] = useState<
    Record<string, TAddressGroupResource[] | undefined>
  >({})
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const selectedAddressGroupsValue = Form.useWatch('addressGroups', form)
  const selectedAddressGroups = useMemo(() => selectedAddressGroupsValue || [], [selectedAddressGroupsValue])
  const isEditMode = Boolean(service)
  const modalTitle = service?.spec?.displayName || service?.metadata.name || 'Service'
  const modalTitleFallback = service?.metadata.name || 'Service'
  const displayNameRules = [
    { max: DISPLAY_NAME_MAX_LENGTH, message: 'Display name must be 63 characters or less' },
    {
      validator: async (_: unknown, value?: string) => {
        if (!validateDisplayName(value)) {
          throw new Error('Use letters, numbers, hyphens, and optional dots')
        }
      },
    },
  ]

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
  const currentBindings = useMemo(
    () => buildCurrentBindings(service, serviceBindingsData?.items),
    [service, serviceBindingsData?.items],
  )
  const initialAddressGroupOptionsNamespace = !isInitialized
    ? currentBindings[0]?.spec?.addressGroup?.namespace || namespace
    : undefined
  const selectedAddressGroupNamespace = addressGroupOptionsNamespace ?? initialAddressGroupOptionsNamespace
  const isAddressGroupsQueryEnabled =
    open && Boolean(selectedAddressGroupNamespace) && !addressGroupsByNamespace[selectedAddressGroupNamespace || '']
  const {
    data: addressGroupsData,
    isLoading: isAddressGroupsLoading,
    error: addressGroupsError,
  } = useQuery({
    queryKey: ['addressgroup-options', cluster, selectedAddressGroupNamespace],
    queryFn: async () => {
      const endpoint = getApiEndpoint(cluster, selectedAddressGroupNamespace || '', 'addressgroups')
      const response = await axios.get<{ items: TAddressGroupResource[] }>(endpoint)

      return response.data
    },
    enabled: isAddressGroupsQueryEnabled,
  })
  const addressGroups = useMemo(
    () => withFallbackNamespace(addressGroupsData?.items, selectedAddressGroupNamespace),
    [addressGroupsData?.items, selectedAddressGroupNamespace],
  )
  const addressGroupCascaderOptions = useMemo(() => {
    const options = getAddressGroupCascaderOptions({
      namespaces: namespaceOptions,
      addressGroupsByNamespace,
      selectedValues: selectedAddressGroups,
      loadingNamespace: isAddressGroupsLoading ? selectedAddressGroupNamespace : undefined,
    })

    return options
  }, [
    addressGroupsByNamespace,
    isAddressGroupsLoading,
    namespaceOptions,
    selectedAddressGroupNamespace,
    selectedAddressGroups,
  ])
  const loadedAddressGroups = useMemo(
    () =>
      Object.values(addressGroupsByNamespace)
        .flat()
        .filter((value): value is TAddressGroupResource => Boolean(value)),
    [addressGroupsByNamespace],
  )
  const overviewKey = useMemo(
    () => `service-overview-${selectedAddressGroupNamespace || 'none'}-${selectedAddressGroups.join('|')}`,
    [selectedAddressGroupNamespace, selectedAddressGroups],
  )
  const addedAddressGroupValues = useMemo(() => {
    if (!service) {
      return []
    }

    const currentAddressGroups = new Set(
      currentBindings
        .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
        .filter((value): value is string => Boolean(value)),
    )

    return selectedAddressGroups.filter(value => !currentAddressGroups.has(value))
  }, [currentBindings, selectedAddressGroups, service])
  const overviewTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildOverviewTreeData({
        addressGroups: loadedAddressGroups,
        selectedAddressGroupValues: selectedAddressGroups,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
        currentService: service,
        addedAddressGroupValues,
      }),
    [
      addedAddressGroupValues,
      hostBindingsData?.items,
      hostsData?.items,
      networkBindingsData?.items,
      networksData?.items,
      loadedAddressGroups,
      service,
      serviceBindingsData?.items,
      servicesData?.items,
      selectedAddressGroups,
    ],
  )
  const isOverviewLoading =
    !isInitialized &&
    ((isAddressGroupsQueryEnabled && isAddressGroupsLoading) ||
      isHostBindingsLoading ||
      isNetworkBindingsLoading ||
      isServiceBindingsLoading ||
      isHostsLoading ||
      isNetworksLoading ||
      isServicesLoading)
  const isFormResourcesLoading =
    isTenantsLoading ||
    Boolean(service && (isServiceBindingsLoading || (isAddressGroupsQueryEnabled && isAddressGroupsLoading)))
  const isInitialLoadPending = open && !isInitialized
  const isModalInitializing = !isInitialized && (isFormResourcesLoading || isInitialLoadPending)

  useEffect(() => {
    if (open && selectedAddressGroupNamespace && addressGroups && !isAddressGroupsLoading) {
      setAddressGroupsByNamespace(currentValue => ({
        ...currentValue,
        [selectedAddressGroupNamespace]: addressGroups,
      }))
    }
  }, [addressGroups, isAddressGroupsLoading, open, selectedAddressGroupNamespace])

  useEffect(() => {
    if (!open) {
      didApplyEditPrefillRef.current = false
      didApplyCreatePrefillRef.current = false
      setAddressGroupOptionsNamespace(undefined)
      setAddressGroupsByNamespace({})
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
        addressGroupNamespace: currentBindings[0]?.spec?.addressGroup?.namespace || namespace,
        addressGroups: currentBindings
          .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
          .filter((value): value is string => Boolean(value)),
        transportEntries: flattenServiceTransports(service.spec?.transports),
      })
      setAddressGroupOptionsNamespace(currentBindings[0]?.spec?.addressGroup?.namespace || namespace)
      setIsInitialized(true)
      return
    }

    if (!service && !isFormResourcesLoading && !didApplyCreatePrefillRef.current) {
      didApplyCreatePrefillRef.current = true
      form.setFieldsValue({
        namespace,
        name: uuidv4(),
        displayName: getCreateDisplayName(),
        description: undefined,
        comment: undefined,
        addressGroupNamespace: namespace,
        addressGroups: [],
        transportEntries: [],
      })
      setAddressGroupOptionsNamespace(namespace)
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
    setAddressGroupOptionsNamespace(undefined)
    setAddressGroupsByNamespace({})
    form.resetFields()
  }, [form, open])

  const handleCancel = () => {
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    setActiveTab('info')
    setIsSubmitting(false)
    setAddressGroupOptionsNamespace(undefined)
    setAddressGroupsByNamespace({})
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
        ['addressGroupNamespace'],
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

    values = {
      ...values,
      addressGroups: values.addressGroups || [],
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
      maskClosable={false}
      onCancel={handleCancel}
      onOk={handleSubmit}
      afterClose={() => {
        didApplyEditPrefillRef.current = false
        didApplyCreatePrefillRef.current = false
        setIsInitialized(false)
        setActiveTab('info')
        setIsSubmitting(false)
        setAddressGroupOptionsNamespace(undefined)
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
              <Form<TServiceFormValues> form={form} layout="vertical" requiredMark>
                <Styled.Header>
                  {isEditMode ? (
                    <EditableResourceTitle
                      fallbackName={modalTitleFallback}
                      kind="Service"
                      placeholder="e.g. api-gateway"
                      rules={displayNameRules}
                    />
                  ) : (
                    renderBadgeWithValue('Service', modalTitle)
                  )}
                </Styled.Header>
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
                <div style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
                  <Form.Item
                    name="namespace"
                    label="Tenant"
                    hidden={isEditMode}
                    rules={[
                      { required: true, message: 'Select tenant' },
                      { pattern: NAME_PATTERN, message: 'Use a valid tenant name' },
                      { max: 63, message: 'Tenant must be 63 characters or less' },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select tenant"
                      options={namespaceOptions}
                      loading={isTenantsLoading}
                      disabled={isEditMode}
                      status={tenantsError ? 'error' : undefined}
                    />
                  </Form.Item>
                  <Form.Item
                    name="name"
                    label="Name"
                    hidden
                    rules={[
                      { required: true, message: 'Enter name' },
                      { pattern: NAME_PATTERN, message: 'Use lowercase letters, numbers, and hyphens' },
                      { max: 63, message: 'Name must be 63 characters or less' },
                    ]}
                  >
                    <Input placeholder="e.g. h-api-prod-01" disabled={isEditMode} />
                  </Form.Item>
                  {!isEditMode && (
                    <Form.Item name="displayName" label="Display name" rules={displayNameRules}>
                      <Input placeholder="e.g. api-gateway" />
                    </Form.Item>
                  )}
                  <Form.Item name="addressGroupNamespace" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="addressGroups"
                    label="Address group"
                    validateStatus={addressGroupsError ? 'error' : undefined}
                    getValueProps={value => ({ value: getAddressGroupCascaderValue(value) })}
                    getValueFromEvent={value => {
                      const nextValues = getAddressGroupValuesFromCascader(value, addressGroupsByNamespace)

                      return nextValues
                    }}
                  >
                    <Cascader
                      multiple
                      placeholder="Select address groups"
                      options={addressGroupCascaderOptions}
                      showCheckedStrategy={Cascader.SHOW_CHILD}
                      displayRender={renderAddressGroupCascaderSelection}
                      loadData={selectedOptions => {
                        const namespaceOption = selectedOptions[0] as TAddressGroupCascaderOption | undefined

                        if (namespaceOption?.value) {
                          setAddressGroupOptionsNamespace(namespaceOption.value)
                        }
                      }}
                      loading={isTenantsLoading || isAddressGroupsLoading}
                      disabled={isTenantsLoading || Boolean(tenantsError)}
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
                          const { key: fieldKey, ...fieldItemProps } = field
                          const protocol = form.getFieldValue(['transportEntries', field.name, 'protocol']) as
                            | 'TCP'
                            | 'UDP'
                            | 'ICMP'
                            | undefined

                          return (
                            <div
                              key={`transport-entry-${field.name}-${fieldKey}`}
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
                                  {...fieldItemProps}
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
                                  {...fieldItemProps}
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
                                    {...fieldItemProps}
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
                                    {...fieldItemProps}
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
                                <Form.Item {...fieldItemProps} name={[field.name, 'description']} label="Description">
                                  <Input placeholder="Briefly describe this transport entry" />
                                </Form.Item>
                                <Form.Item {...fieldItemProps} name={[field.name, 'comment']} label="Comment">
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
                  <Styled.TreeContainer key={overviewKey}>
                    <Tree key={overviewKey} showLine switcherIcon={<CaretDownOutlined />} treeData={overviewTreeData} />
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
