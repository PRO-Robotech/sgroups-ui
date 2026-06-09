/* eslint-disable no-nested-ternary */
/* eslint-disable no-void */
/* eslint-disable max-lines-per-function */
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Cascader, Collapse, Empty, Form, Input, message, Modal, Segmented, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { createNewEntry, TSingleResource, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { v4 as uuidv4 } from 'uuid'
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
  getNamespacedResourceCascaderOptions,
  getNamespacedResourceCascaderValue,
  getNamespacedResourceFromCascaderValue,
  getNamespaceOptions,
  IPV_OPTIONS,
  NAME_PATTERN,
  normalizeOptionalString,
  normalizeTrafficValue,
  PORT_VALUE_SEPARATOR,
  PROTOCOL_OPTIONS,
  EditableResourceTitle,
  renderBadgeWithValue,
  renderNamespacedResourceCascaderSelection,
  validateCIDR,
  validateDisplayName,
  validatePortToken,
} from 'utils'
import { buildRuleEndpointTree } from '../VerboseRulePanel/contentsTree'
import { TTransportEntryFormValue, TUniRuleFormModalProps, TUniRuleFormValues } from './types'
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

const DISPLAY_NAME_MAX_LENGTH = 63
const CREATE_DISPLAY_NAME_PREFIX = 'rules-'
const getCreateDisplayName = () => `${CREATE_DISPLAY_NAME_PREFIX}${Math.floor(100000 + Math.random() * 900000)}`
const DISPLAY_NAME_RULES = [
  {
    max: DISPLAY_NAME_MAX_LENGTH,
    message: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less`,
  },
  {
    validator: async (_: unknown, value?: string) => {
      if (!validateDisplayName(value)) {
        throw new Error('Use letters, numbers, hyphens, and optional dots')
      }
    },
  },
]
const ACTION_VALUES = ACTION_OPTIONS.map(option => option.value)
const TRAFFIC_VALUES = TRAFFIC_OPTIONS.map(option => option.value)
const ENDPOINT_TYPE_VALUES = ENDPOINT_TYPE_OPTIONS.map(option => option.value)
const LOCAL_ENDPOINT_TYPE_VALUES = LOCAL_ENDPOINT_TYPE_OPTIONS.map(option => option.value)
const IPV_VALUES = IPV_OPTIONS.map(option => option.value)
const PROTOCOL_VALUES = PROTOCOL_OPTIONS.map(option => option.value)
type TValidationErrorField = { name?: (string | number)[] }
type TAntdValidationError = { errorFields?: TValidationErrorField[] }

const hasTransportEntryValue = (entry?: TTransportEntryFormValue) =>
  Boolean(
    normalizeOptionalString(entry?.ports) ||
      normalizeOptionalString(entry?.description) ||
      normalizeOptionalString(entry?.comment) ||
      entry?.types?.some(item => normalizeOptionalString(String(item))),
  )

const hasTransportEntries = (entries?: TUniRuleFormValues['transportEntries']) =>
  (entries || []).some(entry => hasTransportEntryValue(entry))
const EMPTY_TRANSPORT_ENTRY: TTransportEntryFormValue = {
  ports: undefined,
  types: undefined,
  description: undefined,
  comment: undefined,
}

const isActionValue = (value?: string) => ACTION_VALUES.some(optionValue => optionValue === value)
const isTrafficValue = (value?: string) => TRAFFIC_VALUES.some(optionValue => optionValue === value)
const isEndpointTypeValue = (value?: string) => ENDPOINT_TYPE_VALUES.some(optionValue => optionValue === value)
const isLocalEndpointTypeValue = (value?: string) =>
  LOCAL_ENDPOINT_TYPE_VALUES.some(optionValue => optionValue === value)
const isIpFamilyValue = (value?: string) => !value || IPV_VALUES.some(optionValue => optionValue === value)
const isProtocolValue = (value?: string) => !value || PROTOCOL_VALUES.some(optionValue => optionValue === value)
const isTransportRequiredForRemote = (remote?: TUniRuleFormValues['remote']) => remote?.type !== 'Service'
const isAntdValidationError = (error: unknown): error is TAntdValidationError =>
  Boolean(error && typeof error === 'object' && 'errorFields' in error)
const getValidationErrorTab = (error: TAntdValidationError): 'info' | 'ports' =>
  error.errorFields?.some(field => String(field.name?.[0] ?? '').startsWith('transport')) ? 'ports' : 'info'
const withFallbackNamespace = <TResource extends { metadata: { namespace?: string } }>(
  items: TResource[] | undefined,
  fallbackNamespace?: string,
) =>
  items?.map(item =>
    item.metadata.namespace || !fallbackNamespace
      ? item
      : {
          ...item,
          metadata: {
            ...item.metadata,
            namespace: fallbackNamespace,
          },
        },
  )

const withInitialTransportEntry = <TValues extends Partial<TUniRuleFormValues>>(values: TValues): TValues => {
  if (!values.transportProtocol || values.transportEntries?.length) {
    return values
  }

  return {
    ...values,
    transportEntries: [{ ...EMPTY_TRANSPORT_ENTRY }],
  }
}

export const UniRuleFormModal: FC<TUniRuleFormModalProps> = ({
  cluster,
  namespace,
  open,
  initialValues,
  rule,
  onClose,
}) => {
  const [form] = Form.useForm<TUniRuleFormValues>()
  const [activeTab, setActiveTab] = useState<'info' | 'ports'>('info')
  const [activeTransportEntryKeys, setActiveTransportEntryKeys] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const localFormValue = Form.useWatch('local', form) as TUniRuleFormValues['local'] | undefined
  const remoteFormValue = Form.useWatch('remote', form) as TUniRuleFormValues['remote'] | undefined
  const isEditMode = Boolean(rule)
  const modalTitle = rule?.spec?.displayName || rule?.metadata.name || 'UniRule'
  const modalTitleFallback = rule?.metadata.name || 'UniRule'
  const currentRuleFormValues = useMemo(() => buildFormValuesFromRule(rule), [rule])
  const initialCreateFormValues = useMemo<Partial<TUniRuleFormValues>>(() => {
    const defaultValues: Partial<TUniRuleFormValues> = {
      namespace,
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
    }

    return {
      ...defaultValues,
      ...initialValues,
      local: {
        type: 'AddressGroup',
        ...initialValues?.local,
      },
      remote: {
        type: 'AddressGroup',
        ...initialValues?.remote,
      },
    }
  }, [initialValues, namespace])
  const localFormEndpoint =
    localFormValue ??
    (!isInitialized ? (rule ? currentRuleFormValues.local : initialCreateFormValues.local) : undefined)
  const remoteFormEndpoint =
    remoteFormValue ??
    (!isInitialized ? (rule ? currentRuleFormValues.remote : initialCreateFormValues.remote) : undefined)
  const localType = localFormEndpoint?.type
  const remoteType = remoteFormEndpoint?.type
  const localNamespace = localFormEndpoint?.namespace
  const remoteNamespace = remoteFormEndpoint?.namespace
  const isLocalAddressGroupsQueryEnabled = open && localType === 'AddressGroup' && Boolean(localNamespace)
  const isRemoteAddressGroupsQueryEnabled = open && remoteType === 'AddressGroup' && Boolean(remoteNamespace)

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

  const { data: localAddressGroupsData, isLoading: isLocalAddressGroupsLoading } = useK8sSmartResource<{
    items: TAddressGroupResource[]
  }>({
    cluster,
    namespace: localNamespace,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'addressgroups',
    isEnabled: isLocalAddressGroupsQueryEnabled,
  })

  const { data: remoteAddressGroupsData, isLoading: isRemoteAddressGroupsLoading } = useK8sSmartResource<{
    items: TAddressGroupResource[]
  }>({
    cluster,
    namespace: remoteNamespace,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'addressgroups',
    isEnabled: isRemoteAddressGroupsQueryEnabled,
  })

  const { data: allAddressGroupsData, isLoading: isAllAddressGroupsLoading } = useK8sSmartResource<{
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
  const addressGroups = useMemo(() => {
    const itemsByKey = new Map<string, TAddressGroupResource>()

    ;[
      ...(allAddressGroupsData?.items || []),
      ...(withFallbackNamespace(localAddressGroupsData?.items, localNamespace) || []),
      ...(withFallbackNamespace(remoteAddressGroupsData?.items, remoteNamespace) || []),
    ].forEach(addressGroup => {
      const resourceName = addressGroup.metadata.name
      const resourceNamespace = addressGroup.metadata.namespace

      if (resourceName && resourceNamespace) {
        itemsByKey.set(`${resourceNamespace}/${resourceName}`, addressGroup)
      }
    })

    return [...itemsByKey.values()]
  }, [
    allAddressGroupsData?.items,
    localAddressGroupsData?.items,
    localNamespace,
    remoteAddressGroupsData?.items,
    remoteNamespace,
  ])
  const addressGroupCascaderOptions = useMemo(
    () =>
      getNamespacedResourceCascaderOptions({
        namespaces: namespaceOptions,
        items: addressGroups,
        badgeLabel: 'AddressGroup',
      }),
    [addressGroups, namespaceOptions],
  )
  const serviceCascaderOptions = useMemo(
    () =>
      getNamespacedResourceCascaderOptions({
        namespaces: namespaceOptions,
        items: servicesData?.items,
        badgeLabel: 'Service',
      }),
    [namespaceOptions, servicesData?.items],
  )
  const localEndpoint = useMemo(() => buildEndpointPayload(localFormEndpoint), [localFormEndpoint])
  const remoteEndpoint = useMemo(() => buildEndpointPayload(remoteFormEndpoint), [remoteFormEndpoint])
  const isLocalEndpointChanged = useMemo(
    () =>
      Boolean(rule) &&
      JSON.stringify(localEndpoint) !== JSON.stringify(buildEndpointPayload(currentRuleFormValues.local)),
    [currentRuleFormValues.local, localEndpoint, rule],
  )
  const isRemoteEndpointChanged = useMemo(
    () =>
      Boolean(rule) &&
      JSON.stringify(remoteEndpoint) !== JSON.stringify(buildEndpointPayload(currentRuleFormValues.remote)),
    [currentRuleFormValues.remote, remoteEndpoint, rule],
  )
  const localResourceOptions = localType === 'Service' ? serviceCascaderOptions : addressGroupCascaderOptions
  const remoteResourceOptions = remoteType === 'Service' ? serviceCascaderOptions : addressGroupCascaderOptions
  const localTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildRuleEndpointTree({
        endpoint: localEndpoint,
        addressGroups,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
      }),
    [
      addressGroups,
      hostBindingsData?.items,
      hostsData?.items,
      localEndpoint,
      networkBindingsData?.items,
      networksData?.items,
      serviceBindingsData?.items,
      servicesData?.items,
    ],
  )
  const remoteTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildRuleEndpointTree({
        endpoint: remoteEndpoint,
        addressGroups,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
      }),
    [
      addressGroups,
      hostBindingsData?.items,
      hostsData?.items,
      networkBindingsData?.items,
      networksData?.items,
      serviceBindingsData?.items,
      servicesData?.items,
      remoteEndpoint,
    ],
  )
  const overviewTreeData = useMemo(
    () =>
      buildOverviewTreeData({
        localTreeData,
        remoteTreeData,
        isLocalChanged: isLocalEndpointChanged,
        isRemoteChanged: isRemoteEndpointChanged,
      }),
    [isLocalEndpointChanged, isRemoteEndpointChanged, localTreeData, remoteTreeData],
  )

  const isOverviewLoading =
    !isInitialized &&
    ((isLocalAddressGroupsQueryEnabled && isLocalAddressGroupsLoading) ||
      (isRemoteAddressGroupsQueryEnabled && isRemoteAddressGroupsLoading) ||
      isAllAddressGroupsLoading ||
      isServicesLoading ||
      isHostBindingsLoading ||
      isNetworkBindingsLoading ||
      isServiceBindingsLoading ||
      isHostsLoading ||
      isNetworksLoading)
  const areEndpointOptionsLoading =
    ((localType === 'Service' || remoteType === 'Service') && isServicesLoading) ||
    (isLocalAddressGroupsQueryEnabled && isLocalAddressGroupsLoading) ||
    (isRemoteAddressGroupsQueryEnabled && isRemoteAddressGroupsLoading)
  const isFormResourcesLoading = isTenantsLoading || Boolean(rule && areEndpointOptionsLoading)
  const isInitialLoadPending = open && !isInitialized
  const isModalInitializing = !isInitialized && (isFormResourcesLoading || isInitialLoadPending)

  useEffect(() => {
    if (!open) {
      didApplyEditPrefillRef.current = false
      didApplyCreatePrefillRef.current = false
      setIsInitialized(false)
      return
    }

    if (rule && !isFormResourcesLoading && !didApplyEditPrefillRef.current) {
      didApplyEditPrefillRef.current = true
      const nextValues = withInitialTransportEntry(buildFormValuesFromRule(rule))

      form.setFieldsValue(nextValues as TUniRuleFormValues)
      setActiveTransportEntryKeys(
        nextValues.transportEntries?.length === 1 && !hasTransportEntryValue(nextValues.transportEntries[0])
          ? ['0']
          : [],
      )
      setIsInitialized(true)
      return
    }

    if (!rule && !isFormResourcesLoading && !didApplyCreatePrefillRef.current) {
      didApplyCreatePrefillRef.current = true
      const nextValues = withInitialTransportEntry({
        name: uuidv4(),
        displayName: getCreateDisplayName(),
        ...initialCreateFormValues,
      })

      form.setFieldsValue(nextValues)
      setActiveTransportEntryKeys(
        nextValues.transportEntries?.length === 1 && !hasTransportEntryValue(nextValues.transportEntries[0])
          ? ['0']
          : [],
      )
      setIsInitialized(true)
    }
  }, [form, initialCreateFormValues, isFormResourcesLoading, open, rule])

  useEffect(() => {
    if (open) {
      return
    }

    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    setActiveTab('info')
    setActiveTransportEntryKeys([])
    setIsSubmitting(false)
    form.resetFields()
  }, [form, open])

  const handleCancel = () => {
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    setActiveTab('info')
    setActiveTransportEntryKeys([])
    setIsSubmitting(false)
    form.resetFields()
    onClose()
  }

  const handleSubmit = async () => {
    let values: TUniRuleFormValues

    try {
      await form.validateFields()
      values = form.getFieldsValue(true) as TUniRuleFormValues
    } catch (error) {
      if (isAntdValidationError(error)) {
        setActiveTab(getValidationErrorTab(error))
        return
      }

      throw error
    }

    const localEndpoint = buildEndpointPayload(values.local)
    const remoteEndpoint = buildEndpointPayload(values.remote)
    const traffic = normalizeTrafficValue(values.traffic)

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
            session: traffic ? { traffic } : undefined,
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

  const handleFormValuesChange = (changedValues: Partial<TUniRuleFormValues>) => {
    if (
      !Object.prototype.hasOwnProperty.call(changedValues, 'transportEntries') &&
      !Object.prototype.hasOwnProperty.call(changedValues, 'remote')
    ) {
      return
    }

    void form.validateFields(['transportIPv', 'transportProtocol']).catch(() => undefined)
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
              <Form<TUniRuleFormValues>
                form={form}
                layout="vertical"
                requiredMark
                onValuesChange={handleFormValuesChange}
              >
                <Styled.Header>
                  {isEditMode ? (
                    <EditableResourceTitle
                      fallbackName={modalTitleFallback}
                      kind="UniRule"
                      placeholder="e.g. api-to-db"
                      rules={DISPLAY_NAME_RULES}
                    />
                  ) : (
                    renderBadgeWithValue('UniRule', modalTitle)
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
                    <Input placeholder="e.g. rule-api-prod-01" disabled={isEditMode} />
                  </Form.Item>
                  {!isEditMode && (
                    <Form.Item name="displayName" label="Display name" rules={DISPLAY_NAME_RULES}>
                      <Input placeholder="e.g. api-to-db" />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="action"
                    label="Action"
                    rules={[
                      { required: true, message: 'Select action' },
                      {
                        validator: async (_, value?: string) => {
                          if (isActionValue(value)) {
                            return
                          }

                          throw new Error('Use Allow or Deny')
                        },
                      },
                    ]}
                  >
                    <Select options={ACTION_OPTIONS as unknown as { label: string; value: string }[]} />
                  </Form.Item>
                  <Form.Item
                    name="traffic"
                    label="Traffic"
                    rules={[
                      { required: true, message: 'Select traffic direction' },
                      {
                        validator: async (_, value?: string) => {
                          if (isTrafficValue(value)) {
                            return
                          }

                          throw new Error('Use Both, Ingress, or Egress')
                        },
                      },
                    ]}
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
                              rules={[
                                { required: true, message: 'Select endpoint type' },
                                {
                                  validator: async (_, value?: string) => {
                                    if (isLocalEndpointTypeValue(value)) {
                                      return
                                    }

                                    throw new Error('Local endpoint must be an address group or service')
                                  },
                                },
                              ]}
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
                                  label="Tenant"
                                  hidden
                                  rules={[
                                    { required: true, message: 'Select resource tenant' },
                                    { pattern: NAME_PATTERN, message: 'Use a valid tenant name' },
                                    { max: 63, message: 'Tenant must be 63 characters or less' },
                                  ]}
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  name={['local', 'name']}
                                  label="Name"
                                  getValueProps={value => ({
                                    value: getNamespacedResourceCascaderValue({
                                      namespace: localNamespace,
                                      name: value,
                                    }),
                                  })}
                                  getValueFromEvent={value => {
                                    const nextValue = getNamespacedResourceFromCascaderValue(value)

                                    form.setFieldValue(['local', 'namespace'], nextValue.namespace)

                                    return nextValue.name
                                  }}
                                  rules={[
                                    { required: true, message: 'Select resource' },
                                    { pattern: NAME_PATTERN, message: 'Use lowercase letters, numbers, and hyphens' },
                                    { max: 63, message: 'Name must be 63 characters or less' },
                                  ]}
                                >
                                  <Cascader
                                    showSearch
                                    options={localResourceOptions}
                                    displayRender={renderNamespacedResourceCascaderSelection(
                                      localType === 'Service' ? 'Service' : 'AddressGroup',
                                    )}
                                    placeholder={localType === 'Service' ? 'Select service' : 'Select address group'}
                                    loading={
                                      isTenantsLoading ||
                                      (localType === 'Service' ? isServicesLoading : isAllAddressGroupsLoading)
                                    }
                                    disabled={isTenantsLoading || Boolean(tenantsError)}
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
                              rules={[
                                { required: true, message: 'Select endpoint type' },
                                {
                                  validator: async (_, value?: string) => {
                                    if (isEndpointTypeValue(value)) {
                                      return
                                    }

                                    throw new Error('Use AddressGroup, Service, FQDN, or CIDR')
                                  },
                                },
                              ]}
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
                                  label="Tenant"
                                  hidden
                                  rules={[
                                    { required: true, message: 'Select resource tenant' },
                                    { pattern: NAME_PATTERN, message: 'Use a valid tenant name' },
                                    { max: 63, message: 'Tenant must be 63 characters or less' },
                                  ]}
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  name={['remote', 'name']}
                                  label="Name"
                                  getValueProps={value => ({
                                    value: getNamespacedResourceCascaderValue({
                                      namespace: remoteNamespace,
                                      name: value,
                                    }),
                                  })}
                                  getValueFromEvent={value => {
                                    const nextValue = getNamespacedResourceFromCascaderValue(value)

                                    form.setFieldValue(['remote', 'namespace'], nextValue.namespace)

                                    return nextValue.name
                                  }}
                                  rules={[
                                    { required: true, message: 'Select resource' },
                                    { pattern: NAME_PATTERN, message: 'Use lowercase letters, numbers, and hyphens' },
                                    { max: 63, message: 'Name must be 63 characters or less' },
                                  ]}
                                >
                                  <Cascader
                                    showSearch
                                    options={remoteResourceOptions}
                                    displayRender={renderNamespacedResourceCascaderSelection(
                                      remoteType === 'Service' ? 'Service' : 'AddressGroup',
                                    )}
                                    placeholder={remoteType === 'Service' ? 'Select service' : 'Select address group'}
                                    loading={
                                      isTenantsLoading ||
                                      (remoteType === 'Service' ? isServicesLoading : isAllAddressGroupsLoading)
                                    }
                                    disabled={isTenantsLoading || Boolean(tenantsError)}
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
                  <Form.Item
                    name="transportIPv"
                    label="IP family"
                    dependencies={['transportProtocol', 'transportEntries', ['remote', 'type']]}
                    rules={[
                      {
                        validator: async (_, value?: string) => {
                          if (!isIpFamilyValue(value)) {
                            throw new Error('Use IPv4 or IPv6')
                          }

                          const entries = form.getFieldValue(
                            'transportEntries',
                          ) as TUniRuleFormValues['transportEntries']
                          const protocol = form.getFieldValue('transportProtocol') as string | undefined

                          if (
                            (isTransportRequiredForRemote(form.getFieldValue('remote')) ||
                              protocol ||
                              hasTransportEntries(entries)) &&
                            !value
                          ) {
                            throw new Error('Select IP family for transport entries')
                          }
                        },
                      },
                    ]}
                  >
                    <Select
                      allowClear
                      placeholder="Select IP family"
                      options={IPV_OPTIONS as unknown as { label: string; value: string }[]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="transportProtocol"
                    label="Protocol"
                    dependencies={['transportIPv', 'transportEntries', ['remote', 'type']]}
                    rules={[
                      {
                        validator: async (_, value?: string) => {
                          if (!isProtocolValue(value)) {
                            throw new Error('Use TCP, UDP, or ICMP')
                          }

                          const entries = form.getFieldValue(
                            'transportEntries',
                          ) as TUniRuleFormValues['transportEntries']
                          const isTransportRequired = isTransportRequiredForRemote(form.getFieldValue('remote'))

                          if ((isTransportRequired || hasTransportEntries(entries)) && !value) {
                            throw new Error('Select protocol for transport entries')
                          }

                          if ((isTransportRequired || value) && !hasTransportEntries(entries)) {
                            throw new Error('Add at least one transport entry')
                          }
                        },
                      },
                    ]}
                  >
                    <Select
                      allowClear
                      placeholder="Select protocol"
                      options={PROTOCOL_OPTIONS as unknown as { label: string; value: string }[]}
                      onChange={value => {
                        const entries = form.getFieldValue('transportEntries') as TUniRuleFormValues['transportEntries']
                        const nextEntries =
                          entries && entries.length > 0 ? entries : value ? [{ ...EMPTY_TRANSPORT_ENTRY }] : []

                        if (nextEntries !== entries) {
                          form.setFieldsValue({ transportEntries: nextEntries })
                          setActiveTransportEntryKeys(value ? ['0'] : [])
                        }

                        nextEntries.forEach((_, index) => {
                          if (value === 'ICMP') {
                            form.setFieldValue(['transportEntries', index, 'ports'], undefined)
                          } else {
                            form.setFieldValue(['transportEntries', index, 'types'], undefined)
                          }
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.List name="transportEntries">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.length === 0 ? (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transport entries" />
                        ) : null}
                        <Collapse
                          activeKey={activeTransportEntryKeys}
                          onChange={keys => setActiveTransportEntryKeys(Array.isArray(keys) ? keys : [keys])}
                          items={fields.map(field => {
                            const fieldItemProps = {
                              fieldKey: field.fieldKey,
                            }
                            const protocol = form.getFieldValue('transportProtocol') as
                              | 'TCP'
                              | 'UDP'
                              | 'ICMP'
                              | undefined

                            return {
                              key: String(field.name),
                              label: `Port ${field.name + 1}`,
                              extra: (
                                <Button
                                  type="text"
                                  icon={<MinusOutlined />}
                                  onClick={event => {
                                    event.stopPropagation()
                                    setActiveTransportEntryKeys(keys =>
                                      keys.filter(key => key !== String(field.name)),
                                    )
                                    remove(field.name)
                                  }}
                                  aria-label={`Remove transport entry ${field.name + 1}`}
                                />
                              ),
                              children: (
                                <>
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
                                    <Input placeholder="Briefly describe this entry" />
                                  </Form.Item>
                                  <Form.Item {...fieldItemProps} name={[field.name, 'comment']} label="Comment">
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
                          <Button
                            type="dashed"
                            onClick={() => {
                              add({ ...EMPTY_TRANSPORT_ENTRY })
                              setActiveTransportEntryKeys([String(fields.length)])
                            }}
                          >
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
                {!isOverviewLoading && !localEndpoint && !remoteEndpoint && (
                  <Styled.OverviewEmpty>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                  </Styled.OverviewEmpty>
                )}
                {!isOverviewLoading && (localEndpoint || remoteEndpoint) && (
                  <Styled.TreeContainer>
                    <Tree showLine switcherIcon={<CaretDownOutlined />} treeData={overviewTreeData} />
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
