import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Collapse, Empty, Form, Input, message, Modal, Segmented, Select, Spin, Tree } from 'antd'
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
  TServiceResource,
} from 'localTypes'
import {
  API_GROUP,
  API_RESOURCE_VERSION,
  API_VERSION,
  FQDN_PATTERN,
  getApiEndpoint,
  getNamespacedResourceOptions,
  getNamespaceOptions,
  getScopedResourceOptions,
  IPV_OPTIONS,
  NAME_PATTERN,
  normalizeOptionalString,
  PORT_VALUE_SEPARATOR,
  PROTOCOL_OPTIONS,
  renderBadgeWithValue,
  validateCIDR,
  validatePortToken,
} from 'utils'
import { buildRuleEndpointTree } from '../VerboseRulePanel/contentsTree'
import { TUniRuleFormModalProps, TUniRuleFormValues } from './types'
import {
  ACTION_OPTIONS,
  buildEndpointPayload,
  buildFormValuesFromRule,
  buildOverviewTreeData,
  buildTransportPayload,
  ENDPOINT_TYPE_OPTIONS,
  LOCAL_ENDPOINT_TYPE_OPTIONS,
  patchRuleSpec,
  TRAFFIC_OPTIONS,
} from './utils'
import { Styled } from './styled'

export const UniRuleFormModal: FC<TUniRuleFormModalProps> = ({ cluster, namespace, open, rule, onClose }) => {
  const [form] = Form.useForm<TUniRuleFormValues>()
  const [activeTab, setActiveTab] = useState<'info' | 'ports'>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const formValues = Form.useWatch([], form) as TUniRuleFormValues | undefined
  const isEditMode = Boolean(rule)

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

  const { data: addressGroupsData, isLoading: isAddressGroupsLoading } = useK8sSmartResource<{
    items: TAddressGroupResource[]
  }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'addressgroups',
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
    () => getNamespacedResourceOptions(addressGroupsData?.items, 'Address Group'),
    [addressGroupsData?.items],
  )
  const serviceOptions = useMemo(
    () => getNamespacedResourceOptions(servicesData?.items, 'Service'),
    [servicesData?.items],
  )

  const localType = formValues?.local?.type
  const remoteType = formValues?.remote?.type
  const localNamespace = formValues?.local?.namespace
  const remoteNamespace = formValues?.remote?.namespace
  const localResourceOptions = useMemo(
    () => getScopedResourceOptions(localType === 'Service' ? serviceOptions : addressGroupOptions, localNamespace),
    [addressGroupOptions, localNamespace, localType, serviceOptions],
  )
  const remoteResourceOptions = useMemo(
    () => getScopedResourceOptions(remoteType === 'Service' ? serviceOptions : addressGroupOptions, remoteNamespace),
    [addressGroupOptions, remoteNamespace, remoteType, serviceOptions],
  )
  const localTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildRuleEndpointTree({
        endpoint: buildEndpointPayload(formValues?.local),
        addressGroups: addressGroupsData?.items,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
      }),
    [
      addressGroupsData?.items,
      formValues?.local,
      hostBindingsData?.items,
      hostsData?.items,
      networkBindingsData?.items,
      networksData?.items,
      serviceBindingsData?.items,
      servicesData?.items,
    ],
  )
  const remoteTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildRuleEndpointTree({
        endpoint: buildEndpointPayload(formValues?.remote),
        addressGroups: addressGroupsData?.items,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
      }),
    [
      addressGroupsData?.items,
      formValues?.remote,
      hostBindingsData?.items,
      hostsData?.items,
      networkBindingsData?.items,
      networksData?.items,
      serviceBindingsData?.items,
      servicesData?.items,
    ],
  )
  const overviewTreeData = useMemo(
    () => buildOverviewTreeData({ localTreeData, remoteTreeData }),
    [localTreeData, remoteTreeData],
  )

  const isOverviewLoading =
    isAddressGroupsLoading ||
    isServicesLoading ||
    isHostBindingsLoading ||
    isNetworkBindingsLoading ||
    isServiceBindingsLoading ||
    isHostsLoading ||
    isNetworksLoading
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

    if (rule && !isFormResourcesLoading && !didApplyEditPrefillRef.current) {
      didApplyEditPrefillRef.current = true
      form.setFieldsValue(buildFormValuesFromRule(rule) as TUniRuleFormValues)
      setIsInitialized(true)
      return
    }

    if (!rule && !isFormResourcesLoading && !didApplyCreatePrefillRef.current) {
      didApplyCreatePrefillRef.current = true
      form.setFieldsValue({
        namespace,
        name: undefined,
        displayName: undefined,
        action: 'Allow',
        traffic: 'Both',
        description: undefined,
        comment: undefined,
        local: {
          type: 'AddressGroup',
        },
        remote: {
          type: 'AddressGroup',
        },
        transportIPv: 'IPv4',
        transportProtocol: undefined,
        transportEntries: [],
      })
      setIsInitialized(true)
    }
  }, [form, isFormResourcesLoading, namespace, open, rule])

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
    await form.validateFields()
    const values = form.getFieldsValue(true) as TUniRuleFormValues
    const localEndpoint = buildEndpointPayload(values.local)
    const remoteEndpoint = buildEndpointPayload(values.remote)

    if (!localEndpoint || !remoteEndpoint) {
      message.error('Configure both local and remote endpoints')
      return
    }

    const transport = buildTransportPayload(values)

    setIsSubmitting(true)

    try {
      const body = {
        apiVersion: rule?.apiVersion || API_RESOURCE_VERSION,
        kind: rule?.kind || 'Rule',
        metadata: rule
          ? {
              ...rule.metadata,
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
            action: values.action,
            endpoints: {
              local: localEndpoint,
              remote: remoteEndpoint,
            },
            session: values.traffic ? { traffic: values.traffic } : undefined,
            transport,
          }).filter(([, value]) => value !== undefined),
        ),
      }

      if (rule) {
        const ruleEndpoint = `${getApiEndpoint(cluster, values.namespace, 'rules')}/${values.name}`
        const changedFieldsCount = await patchRuleSpec(ruleEndpoint, rule, values)

        if (changedFieldsCount === 0) {
          message.info('No changes to save')
          handleCancel()
          return
        }

        await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        message.success('Rule updated')
        handleCancel()
        return
      }

      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'rules'),
        body,
      })

      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      message.success('Rule created')
      handleCancel()
    } catch (error) {
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} rule: ${String(error)}`)
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
      width="70vw"
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
              <Styled.Header>{renderBadgeWithValue('UniRule', 'UniRule')}</Styled.Header>
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
              <Form<TUniRuleFormValues> form={form} layout="vertical" requiredMark>
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
                    <Input placeholder="e.g. rule-api-prod-01" disabled={isEditMode} />
                  </Form.Item>
                  <Form.Item name="displayName" label="Display name">
                    <Input placeholder="e.g. api to db" />
                  </Form.Item>
                  <Form.Item name="action" label="Action" rules={[{ required: true, message: 'Select action' }]}>
                    <Select options={ACTION_OPTIONS as unknown as { label: string; value: string }[]} />
                  </Form.Item>
                  <Form.Item
                    name="traffic"
                    label="Traffic"
                    rules={[{ required: true, message: 'Select traffic direction' }]}
                  >
                    <Select options={TRAFFIC_OPTIONS as unknown as { label: string; value: string }[]} />
                  </Form.Item>
                  <Collapse
                    defaultActiveKey={['local', 'remote']}
                    items={[
                      {
                        key: 'local',
                        label: 'Local',
                        children: (
                          <>
                            <Form.Item
                              name={['local', 'type']}
                              label="Type"
                              rules={[{ required: true, message: 'Select endpoint type' }]}
                            >
                              <Select
                                options={LOCAL_ENDPOINT_TYPE_OPTIONS as unknown as { label: string; value: string }[]}
                                onChange={() => {
                                  form.setFieldValue(['local', 'namespace'], undefined)
                                  form.setFieldValue(['local', 'name'], undefined)
                                  form.setFieldValue(['local', 'value'], undefined)
                                }}
                              />
                            </Form.Item>
                            {(localType === 'AddressGroup' || localType === 'Service') && (
                              <>
                                <Form.Item
                                  name={['local', 'namespace']}
                                  label="Namespace"
                                  rules={[{ required: true, message: 'Select resource namespace' }]}
                                >
                                  <Select
                                    showSearch
                                    options={namespaceOptions}
                                    placeholder="Select namespace"
                                    onChange={() => {
                                      form.setFieldValue(['local', 'name'], undefined)
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={['local', 'name']}
                                  label="Name"
                                  rules={[{ required: true, message: 'Select resource' }]}
                                >
                                  <Select
                                    showSearch
                                    optionFilterProp="searchText"
                                    disabled={!localNamespace}
                                    placeholder={
                                      localNamespace
                                        ? `Select ${localType === 'Service' ? 'service' : 'address group'}`
                                        : 'Select namespace first'
                                    }
                                    options={localResourceOptions}
                                  />
                                </Form.Item>
                              </>
                            )}
                            {localType === 'FQDN' && (
                              <Form.Item
                                name={['local', 'value']}
                                label="FQDN"
                                rules={[
                                  { required: true, message: 'Enter FQDN' },
                                  {
                                    validator: async (_, value?: string) => {
                                      const normalizedValue = normalizeOptionalString(value)

                                      if (!normalizedValue || !FQDN_PATTERN.test(normalizedValue)) {
                                        throw new Error('Use a valid FQDN like api.example.com')
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input placeholder="e.g. api.example.com" />
                              </Form.Item>
                            )}
                            {localType === 'CIDR' && (
                              <Form.Item
                                name={['local', 'value']}
                                label="CIDR"
                                rules={[
                                  { required: true, message: 'Enter CIDR' },
                                  {
                                    validator: async (_, value?: string) => {
                                      if (!validateCIDR(value)) {
                                        throw new Error('Use a valid CIDR like 10.0.0.0/8 or 2001:db8::/64')
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input placeholder="e.g. 10.0.0.0/8" />
                              </Form.Item>
                            )}
                          </>
                        ),
                      },
                      {
                        key: 'remote',
                        label: 'Remote',
                        children: (
                          <>
                            <Form.Item
                              name={['remote', 'type']}
                              label="Type"
                              rules={[{ required: true, message: 'Select endpoint type' }]}
                            >
                              <Select
                                options={ENDPOINT_TYPE_OPTIONS as unknown as { label: string; value: string }[]}
                                onChange={() => {
                                  form.setFieldValue(['remote', 'namespace'], undefined)
                                  form.setFieldValue(['remote', 'name'], undefined)
                                  form.setFieldValue(['remote', 'value'], undefined)
                                }}
                              />
                            </Form.Item>
                            {(remoteType === 'AddressGroup' || remoteType === 'Service') && (
                              <>
                                <Form.Item
                                  name={['remote', 'namespace']}
                                  label="Namespace"
                                  rules={[{ required: true, message: 'Select resource namespace' }]}
                                >
                                  <Select
                                    showSearch
                                    options={namespaceOptions}
                                    placeholder="Select namespace"
                                    onChange={() => {
                                      form.setFieldValue(['remote', 'name'], undefined)
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={['remote', 'name']}
                                  label="Name"
                                  rules={[{ required: true, message: 'Select resource' }]}
                                >
                                  <Select
                                    showSearch
                                    optionFilterProp="searchText"
                                    disabled={!remoteNamespace}
                                    placeholder={
                                      remoteNamespace
                                        ? `Select ${remoteType === 'Service' ? 'service' : 'address group'}`
                                        : 'Select namespace first'
                                    }
                                    options={remoteResourceOptions}
                                  />
                                </Form.Item>
                              </>
                            )}
                            {remoteType === 'FQDN' && (
                              <Form.Item
                                name={['remote', 'value']}
                                label="FQDN"
                                rules={[
                                  { required: true, message: 'Enter FQDN' },
                                  {
                                    validator: async (_, value?: string) => {
                                      const normalizedValue = normalizeOptionalString(value)

                                      if (!normalizedValue || !FQDN_PATTERN.test(normalizedValue)) {
                                        throw new Error('Use a valid FQDN like api.example.com')
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input placeholder="e.g. api.example.com" />
                              </Form.Item>
                            )}
                            {remoteType === 'CIDR' && (
                              <Form.Item
                                name={['remote', 'value']}
                                label="CIDR"
                                rules={[
                                  { required: true, message: 'Enter CIDR' },
                                  {
                                    validator: async (_, value?: string) => {
                                      if (!validateCIDR(value)) {
                                        throw new Error('Use a valid CIDR like 10.0.0.0/8 or 2001:db8::/64')
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input placeholder="e.g. 10.0.0.0/8" />
                              </Form.Item>
                            )}
                          </>
                        ),
                      },
                    ]}
                  />
                  <Form.Item name="description" label="Description">
                    <Input placeholder="Briefly describe the rule's purpose" />
                  </Form.Item>
                  <Form.Item name="comment" label="Comment">
                    <Input.TextArea
                      placeholder="Add any additional notes here..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>
                </div>
                <div style={{ display: activeTab === 'ports' ? 'block' : 'none' }}>
                  <Form.Item name="transportIPv" label="IP family">
                    <Select
                      allowClear
                      placeholder="Select IP family"
                      options={IPV_OPTIONS as unknown as { label: string; value: string }[]}
                    />
                  </Form.Item>
                  <Form.Item name="transportProtocol" label="Protocol">
                    <Select
                      allowClear
                      placeholder="Select protocol"
                      options={PROTOCOL_OPTIONS as unknown as { label: string; value: string }[]}
                    />
                  </Form.Item>
                  <Form.List name="transportEntries">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.length === 0 ? (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transport entries" />
                        ) : null}
                        <Collapse
                          items={fields.map(field => {
                            const protocol = form.getFieldValue('transportProtocol') as
                              | 'TCP'
                              | 'UDP'
                              | 'ICMP'
                              | undefined

                            return {
                              key: String(field.key),
                              label: `Port ${field.name + 1}`,
                              extra: (
                                <Button
                                  type="text"
                                  icon={<MinusOutlined />}
                                  onClick={event => {
                                    event.stopPropagation()
                                    remove(field.name)
                                  }}
                                  aria-label={`Remove transport entry ${field.name + 1}`}
                                />
                              ),
                              children: (
                                <>
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
                                    <Input placeholder="Briefly describe this entry" />
                                  </Form.Item>
                                  <Form.Item {...field} name={[field.name, 'comment']} label="Comment">
                                    <Input.TextArea
                                      placeholder="Add any additional notes here..."
                                      autoSize={{ minRows: 2, maxRows: 4 }}
                                    />
                                  </Form.Item>
                                </>
                              ),
                            }
                          })}
                        />
                        <Styled.EntryActions>
                          <Button type="dashed" onClick={() => add({})}>
                            <PlusOutlined />
                            Add transport entry
                          </Button>
                        </Styled.EntryActions>
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
                {!isOverviewLoading &&
                  !buildEndpointPayload(formValues?.local) &&
                  !buildEndpointPayload(formValues?.remote) && (
                    <Styled.OverviewEmpty>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                    </Styled.OverviewEmpty>
                  )}
                {!isOverviewLoading &&
                  (buildEndpointPayload(formValues?.local) || buildEndpointPayload(formValues?.remote)) && (
                    <Styled.TreeContainer>
                      <Tree
                        showLine
                        switcherIcon={<CaretDownOutlined />}
                        defaultExpandAll
                        treeData={overviewTreeData}
                      />
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
