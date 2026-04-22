import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Collapse, Empty, Form, Input, message, Modal, Segmented, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import {
  createNewEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
  TSingleResource,
  useK8sSmartResource,
} from '@prorobotech/openapi-k8s-toolkit'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { renderBadgeWithValue } from 'utils'
import { buildRuleEndpointTree } from '../VerboseRulePanel/contentsTree'
import { TRuleEndpoint, TRuleResource, TRuleRow } from '../../tableConfig'
import {
  Count,
  EntryActions,
  FormColumn,
  Header,
  LoadingState,
  ModalContent,
  Overview,
  OverviewBody,
  OverviewEmpty,
  OverviewTitle,
  SegmentedWrap,
  TreeContainer,
} from './styled'

const API_GROUP = 'sgroups.io'
const API_VERSION = 'v1alpha1'
const API_RESOURCE_VERSION = `${API_GROUP}/${API_VERSION}`
const NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const PORT_VALUE_SEPARATOR = /\s*,\s*/
const HEX_GROUP_PATTERN = /^[0-9a-f]{1,4}$/i
const FQDN_PATTERN = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i
const ENDPOINT_TYPE_OPTIONS = [
  { label: 'Address Group', value: 'AddressGroup' },
  { label: 'Service', value: 'Service' },
  { label: 'FQDN', value: 'FQDN' },
  { label: 'CIDR', value: 'CIDR' },
] as const
const ACTION_OPTIONS = [
  { label: 'Allow', value: 'Allow' },
  { label: 'Deny', value: 'Deny' },
] as const
const TRAFFIC_OPTIONS = [
  { label: 'Both', value: 'Both' },
  { label: 'Ingress', value: 'Ingress' },
  { label: 'Egress', value: 'Egress' },
] as const
const IPV_OPTIONS = [
  { label: 'IPv4', value: 'IPv4' },
  { label: 'IPv6', value: 'IPv6' },
] as const
const PROTOCOL_OPTIONS = [
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' },
  { label: 'ICMP', value: 'ICMP' },
] as const

type TEndpointFormValues = {
  type?: TRuleEndpoint['type']
  namespace?: string
  name?: string
  value?: string
}

type TTransportEntryFormValue = {
  ports?: string
  types?: string[]
  description?: string
  comment?: string
}

type TUniRuleFormValues = {
  namespace: string
  name: string
  displayName?: string
  action: 'Allow' | 'Deny'
  traffic?: 'Both' | 'Ingress' | 'Egress'
  description?: string
  comment?: string
  local?: TEndpointFormValues
  remote?: TEndpointFormValues
  transportIPv?: 'IPv4' | 'IPv6'
  transportProtocol?: 'TCP' | 'UDP' | 'ICMP'
  transportEntries?: TTransportEntryFormValue[]
}

type TResourceOption = {
  value: string
  label: React.ReactNode
  searchText: string
}

type TUniRuleFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  rule?: TRuleRow | null
  onClose: () => void
}

const getApiEndpoint = (cluster: string, namespaceValue: string, plural: string) =>
  `/api/clusters/${cluster}/k8s/apis/${API_GROUP}/${API_VERSION}/namespaces/${namespaceValue}/${plural}`

const normalizeOptionalString = (value?: string) => {
  const trimmedValue = value?.trim()

  return trimmedValue || undefined
}

const parseNamespacedValue = (value?: string) => {
  if (!value) {
    return {}
  }

  const [resourceNamespace, ...nameParts] = value.split('/')

  return {
    namespace: resourceNamespace,
    name: nameParts.join('/'),
  }
}

const getResourceOptions = (
  items: Array<{ metadata: { name?: string; namespace?: string }; spec?: { displayName?: string } }> | undefined,
  badgeLabel: 'Address Group' | 'Service',
): TResourceOption[] =>
  (items || [])
    .reduce<TResourceOption[]>((acc, item) => {
      const resourceName = item.metadata.name
      const resourceNamespace = item.metadata.namespace

      if (!resourceName || !resourceNamespace) {
        return acc
      }

      const displayValue = `${resourceNamespace} / ${item.spec?.displayName || resourceName}`
      acc.push({
        value: `${resourceNamespace}/${resourceName}`,
        label: renderBadgeWithValue(badgeLabel, displayValue),
        searchText: `${resourceNamespace} ${resourceName} ${item.spec?.displayName || ''}`.trim(),
      })

      return acc
    }, [])
    .sort((first, second) => first.searchText.localeCompare(second.searchText))

const getScopedResourceOptions = (options: TResourceOption[], selectedNamespace?: string) =>
  selectedNamespace
    ? options
        .filter(option => option.value.startsWith(`${selectedNamespace}/`))
        .map(option => ({
          ...option,
          value: parseNamespacedValue(option.value).name || option.value,
        }))
    : []

const isValidIPv4 = (value: string) => {
  const octets = value.split('.')

  if (octets.length !== 4) {
    return false
  }

  return octets.every(octet => {
    if (!/^\d+$/.test(octet)) {
      return false
    }

    if (octet.length > 1 && octet.startsWith('0')) {
      return false
    }

    const parsedValue = Number(octet)

    return Number.isInteger(parsedValue) && parsedValue >= 0 && parsedValue <= 255
  })
}

const isValidIPv6 = (value: string) => {
  if (!value || value.includes(':::')) {
    return false
  }

  const doubleColonParts = value.split('::')

  if (doubleColonParts.length > 2) {
    return false
  }

  const parseGroups = (part: string) => {
    if (!part) {
      return []
    }

    return part.split(':')
  }

  const leftGroups = parseGroups(doubleColonParts[0])
  const rightGroups = parseGroups(doubleColonParts[1] || '')
  const allGroups = [...leftGroups, ...rightGroups]

  if (allGroups.some(group => !HEX_GROUP_PATTERN.test(group))) {
    return false
  }

  if (doubleColonParts.length === 1) {
    return allGroups.length === 8
  }

  return allGroups.length < 8
}

const validateCIDR = (value?: string) => {
  const normalizedValue = normalizeOptionalString(value)

  if (!normalizedValue) {
    return false
  }

  const separatorIndex = normalizedValue.lastIndexOf('/')

  if (separatorIndex <= 0 || separatorIndex === normalizedValue.length - 1) {
    return false
  }

  const addressPart = normalizedValue.slice(0, separatorIndex)
  const prefixPart = normalizedValue.slice(separatorIndex + 1)

  if (!/^\d+$/.test(prefixPart)) {
    return false
  }

  const prefix = Number(prefixPart)

  if (addressPart.includes('.')) {
    return isValidIPv4(addressPart) && prefix >= 0 && prefix <= 32
  }

  if (addressPart.includes(':')) {
    return isValidIPv6(addressPart) && prefix >= 0 && prefix <= 128
  }

  return false
}

const validatePortToken = (value: string) => {
  if (!value) {
    return false
  }

  const rangeMatch = value.match(/^(\d+)-(\d+)$/)

  if (rangeMatch) {
    const rangeStart = Number(rangeMatch[1])
    const rangeEnd = Number(rangeMatch[2])

    return (
      Number.isInteger(rangeStart) &&
      Number.isInteger(rangeEnd) &&
      rangeStart >= 1 &&
      rangeStart <= 65535 &&
      rangeEnd >= 1 &&
      rangeEnd <= 65535 &&
      rangeStart <= rangeEnd
    )
  }

  const port = Number(value)

  return Number.isInteger(port) && port >= 1 && port <= 65535
}

const buildEndpointPayload = (endpoint?: TEndpointFormValues): TRuleEndpoint | undefined => {
  if (!endpoint?.type) {
    return undefined
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    const value = normalizeOptionalString(endpoint.value)

    return value
      ? {
          type: endpoint.type,
          value,
        }
      : undefined
  }

  const name = normalizeOptionalString(endpoint.name)
  const namespace = normalizeOptionalString(endpoint.namespace)

  return name && namespace
    ? {
        type: endpoint.type,
        name,
        namespace,
      }
    : undefined
}

const buildTransportEntries = (entries?: TTransportEntryFormValue[]) =>
  (entries || [])
    .map(entry => {
      const ports = normalizeOptionalString(entry.ports)
      const types = (entry.types || [])
        .map(item => Number(String(item).trim()))
        .filter(item => Number.isInteger(item) && item >= 0 && item <= 255)

      return {
        ports,
        types: types.length > 0 ? types : undefined,
        description: normalizeOptionalString(entry.description),
        comment: normalizeOptionalString(entry.comment),
      }
    })
    .filter(entry => entry.ports || (entry.types && entry.types.length > 0) || entry.description || entry.comment)

const buildTransportPayload = (values: TUniRuleFormValues) => {
  const entries = buildTransportEntries(values.transportEntries)

  if (!values.transportProtocol || !values.transportIPv || entries.length === 0) {
    return undefined
  }

  return {
    protocol: values.transportProtocol,
    IPv: values.transportIPv,
    entries,
  }
}

const buildFormValuesFromRule = (rule?: TRuleResource | null): Partial<TUniRuleFormValues> => ({
  namespace: rule?.metadata.namespace,
  name: rule?.metadata.name,
  displayName: rule?.spec?.displayName,
  action: rule?.spec?.action || 'Allow',
  traffic: rule?.spec?.session?.traffic,
  description: rule?.spec?.description,
  comment: rule?.spec?.comment,
  local: {
    type: rule?.spec?.endpoints?.local?.type,
    namespace: rule?.spec?.endpoints?.local?.namespace,
    name: rule?.spec?.endpoints?.local?.name,
    value: rule?.spec?.endpoints?.local?.value,
  },
  remote: {
    type: rule?.spec?.endpoints?.remote?.type,
    namespace: rule?.spec?.endpoints?.remote?.namespace,
    name: rule?.spec?.endpoints?.remote?.name,
    value: rule?.spec?.endpoints?.remote?.value,
  },
  transportIPv: rule?.spec?.transport?.IPv,
  transportProtocol: rule?.spec?.transport?.protocol,
  transportEntries:
    rule?.spec?.transport?.entries?.map(entry => ({
      ports: entry.ports,
      types: entry.types?.map(item => String(item)),
      description: entry.description,
      comment: entry.comment,
    })) || [],
})

const buildOverviewTitle = (label: 'Local' | 'Remote', count: number) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span>{label}</span>
    <Count>{count}</Count>
  </span>
)

const buildOverviewTreeData = ({
  localTreeData,
  remoteTreeData,
}: {
  localTreeData: TreeDataNode[]
  remoteTreeData: TreeDataNode[]
}): TreeDataNode[] => [
  {
    title: buildOverviewTitle('Local', localTreeData.length),
    key: 'overview-local',
    children: localTreeData,
  },
  {
    title: buildOverviewTitle('Remote', remoteTreeData.length),
    key: 'overview-remote',
    children: remoteTreeData,
  },
]

const patchRuleSpec = async (endpoint: string, currentRule: TRuleResource, values: TUniRuleFormValues) => {
  const patchRequests: Promise<unknown>[] = []
  const normalizedCurrent = buildFormValuesFromRule(currentRule)
  const nextLocal = buildEndpointPayload(values.local)
  const nextRemote = buildEndpointPayload(values.remote)
  const nextTransport = buildTransportPayload(values)
  const nextTraffic = values.traffic || undefined

  ;(
    [
      [
        'displayName',
        normalizeOptionalString(values.displayName),
        normalizeOptionalString(currentRule.spec?.displayName),
      ],
      [
        'description',
        normalizeOptionalString(values.description),
        normalizeOptionalString(currentRule.spec?.description),
      ],
      ['comment', normalizeOptionalString(values.comment), normalizeOptionalString(currentRule.spec?.comment)],
    ] as const
  ).forEach(([fieldName, nextValue, currentValue]) => {
    if (nextValue === currentValue) {
      return
    }

    if (nextValue === undefined) {
      patchRequests.push(
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: `/spec/${fieldName}`,
        }),
      )

      return
    }

    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: `/spec/${fieldName}`,
        body: nextValue,
      }),
    )
  })

  if (values.action !== currentRule.spec?.action) {
    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/action',
        body: values.action,
      }),
    )
  }

  if (JSON.stringify(nextLocal) !== JSON.stringify(buildEndpointPayload(normalizedCurrent.local))) {
    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/endpoints/local',
        body: nextLocal,
      }),
    )
  }

  if (JSON.stringify(nextRemote) !== JSON.stringify(buildEndpointPayload(normalizedCurrent.remote))) {
    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/endpoints/remote',
        body: nextRemote,
      }),
    )
  }

  if (nextTraffic !== currentRule.spec?.session?.traffic) {
    if (nextTraffic === undefined) {
      patchRequests.push(
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: '/spec/session',
        }),
      )
    } else {
      patchRequests.push(
        patchEntryWithReplaceOp({
          endpoint,
          pathToValue: '/spec/session',
          body: { traffic: nextTraffic },
        }),
      )
    }
  }

  if (JSON.stringify(nextTransport) !== JSON.stringify(currentRule.spec?.transport)) {
    if (nextTransport === undefined) {
      patchRequests.push(
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: '/spec/transport',
        }),
      )
    } else {
      patchRequests.push(
        patchEntryWithReplaceOp({
          endpoint,
          pathToValue: '/spec/transport',
          body: nextTransport,
        }),
      )
    }
  }

  await Promise.all(patchRequests)

  return patchRequests.length
}

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

  const namespaceOptions = useMemo(
    () =>
      (tenantsData?.items || [])
        .map(item => item.metadata?.name)
        .filter((value): value is string => Boolean(value))
        .sort((first, second) => first.localeCompare(second))
        .map(value => ({ value, label: value })),
    [tenantsData?.items],
  )
  const addressGroupOptions = useMemo(
    () => getResourceOptions(addressGroupsData?.items, 'Address Group'),
    [addressGroupsData?.items],
  )
  const serviceOptions = useMemo(() => getResourceOptions(servicesData?.items, 'Service'), [servicesData?.items])

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
      destroyOnClose
    >
      <ModalContent>
        {isModalInitializing ? (
          <LoadingState>
            <Spin size="large" />
          </LoadingState>
        ) : (
          <>
            <FormColumn>
              <Header>{renderBadgeWithValue('UniRule', 'UniRule')}</Header>
              <SegmentedWrap>
                <Segmented
                  options={[
                    { label: 'Info', value: 'info' },
                    { label: 'Ports', value: 'ports' },
                  ]}
                  value={activeTab}
                  onChange={value => setActiveTab(value as 'info' | 'ports')}
                />
              </SegmentedWrap>
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
                                options={ENDPOINT_TYPE_OPTIONS as unknown as { label: string; value: string }[]}
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
                        <EntryActions>
                          <Button type="dashed" onClick={() => add({})}>
                            <PlusOutlined />
                            Add transport entry
                          </Button>
                        </EntryActions>
                      </>
                    )}
                  </Form.List>
                </div>
              </Form>
            </FormColumn>
            <Overview>
              <OverviewTitle>Structure Overview</OverviewTitle>
              <OverviewBody>
                {isOverviewLoading && <Spin />}
                {!isOverviewLoading &&
                  !buildEndpointPayload(formValues?.local) &&
                  !buildEndpointPayload(formValues?.remote) && (
                    <OverviewEmpty>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                    </OverviewEmpty>
                  )}
                {!isOverviewLoading &&
                  (buildEndpointPayload(formValues?.local) || buildEndpointPayload(formValues?.remote)) && (
                    <TreeContainer>
                      <Tree
                        showLine
                        switcherIcon={<CaretDownOutlined />}
                        defaultExpandAll
                        treeData={overviewTreeData}
                      />
                    </TreeContainer>
                  )}
              </OverviewBody>
            </Overview>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
