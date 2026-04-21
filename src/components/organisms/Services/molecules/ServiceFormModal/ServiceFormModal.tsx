import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Form, Input, message, Modal, Segmented, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import {
  createNewEntry,
  deleteEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
  TSingleResource,
  useK8sSmartResource,
} from '@prorobotech/openapi-k8s-toolkit'
import { buildAddressGroupContentsTree } from 'components/organisms/AddressGroups/molecules/VerboseAddressGroupPanel/contentsTree'
import {
  TAddressGroupResource,
  TBindingBase,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
} from 'localTypes'
import { renderBadgeWithValue } from 'utils'
import { TServiceResource, TServiceRow } from '../../tableConfig'
import { buildServiceTransports, flattenServiceTransports, normalizeServiceTransports } from './transportUtils'
import {
  Count,
  FormColumn,
  Header,
  LoadingState,
  ModalContent,
  Overview,
  OverviewBody,
  OverviewEmpty,
  OverviewTitle,
  PortsActions,
  SegmentedWrap,
  TreeContainer,
} from './styled'

const API_GROUP = 'sgroups.io'
const API_VERSION = 'v1alpha1'
const API_RESOURCE_VERSION = `${API_GROUP}/${API_VERSION}`
const NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const PORT_VALUE_SEPARATOR = /\s*,\s*/
const IPV_OPTIONS = [
  { label: 'IPv4', value: 'IPv4' },
  { label: 'IPv6', value: 'IPv6' },
] as const
const PROTOCOL_OPTIONS = [
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' },
  { label: 'ICMP', value: 'ICMP' },
] as const

type TServiceFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  service?: TServiceRow | null
  onClose: () => void
}

type TServiceFormValues = {
  namespace: string
  name: string
  displayName?: string
  addressGroups?: string[]
  description?: string
  comment?: string
  transportEntries?: {
    IPv?: 'IPv4' | 'IPv6'
    protocol?: 'TCP' | 'UDP' | 'ICMP'
    ports?: string
    types?: string[]
    description?: string
    comment?: string
  }[]
}

type TResourceOption = {
  value: string
  label: React.ReactNode
  searchText: string
}

const getApiEndpoint = (cluster: string, namespaceValue: string, plural: string) =>
  `/api/clusters/${cluster}/k8s/apis/${API_GROUP}/${API_VERSION}/namespaces/${namespaceValue}/${plural}`

const normalizeOptionalString = (value?: string) => {
  const trimmedValue = value?.trim()

  return trimmedValue || undefined
}

const sanitizeBindingName = (value: string) => {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)
    .replace(/-$/g, '')

  return sanitized || 'binding'
}

const buildBindingName = (serviceName: string, addressGroupNamespace: string, addressGroupName: string) =>
  sanitizeBindingName(`${serviceName}-ag-${addressGroupNamespace}-${addressGroupName}`)

const parseNamespacedValue = (value: string) => {
  const [resourceNamespace, ...nameParts] = value.split('/')

  return {
    namespace: resourceNamespace,
    name: nameParts.join('/'),
  }
}

const buildNamespacedValue = (resource?: { namespace?: string; name?: string }) =>
  resource?.name && resource?.namespace ? `${resource.namespace}/${resource.name}` : undefined

const renderAddressGroupOptionLabel = (value: string) => renderBadgeWithValue('Address Group', value)

const getAddressGroupOptions = (items?: TAddressGroupResource[]): TResourceOption[] =>
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
        label: renderAddressGroupOptionLabel(displayValue),
        searchText: `${resourceNamespace} ${resourceName} ${item.spec?.displayName || ''}`.trim(),
      })

      return acc
    }, [])
    .sort((first, second) => first.searchText.localeCompare(second.searchText))

const getBindingLookupKey = (resource?: { name?: string; namespace?: string }) =>
  resource?.name ? `${resource.namespace || ''}/${resource.name}` : null

const isSameService = (
  resource: TServiceResource | null | undefined,
  serviceRef?: { name?: string; namespace?: string },
) => serviceRef?.name === resource?.metadata.name && serviceRef?.namespace === resource?.metadata.namespace

const buildCurrentBindings = (
  service: TServiceResource | null | undefined,
  serviceBindings?: TServiceBindingResource[],
) => (serviceBindings || []).filter(binding => isSameService(service, binding.spec?.service))

const isBindingRelatedToSelectedAddressGroups = (binding: TBindingBase, selectedAddressGroupValues: string[]) => {
  const relatedValue = buildNamespacedValue(binding.spec?.addressGroup)

  return relatedValue ? selectedAddressGroupValues.includes(relatedValue) : false
}

const buildOverviewTitle = (addressGroup?: TAddressGroupResource, value?: string, bindingsCount?: number) => {
  const parsedValue = value ? parseNamespacedValue(value) : undefined
  const displayName = addressGroup?.spec?.displayName || addressGroup?.metadata.name || parsedValue?.name || 'Unknown'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {renderBadgeWithValue('Address Group', displayName)}
      <Count>{bindingsCount || 0}</Count>
    </span>
  )
}

const buildOverviewTreeData = ({
  addressGroups,
  selectedAddressGroupValues,
  hostBindings,
  networkBindings,
  serviceBindings,
  hosts,
  networks,
  services,
}: {
  addressGroups?: TAddressGroupResource[]
  selectedAddressGroupValues: string[]
  hostBindings?: THostBindingResource[]
  networkBindings?: TNetworkBindingResource[]
  serviceBindings?: TServiceBindingResource[]
  hosts?: THostResource[]
  networks?: TNetworkResource[]
  services?: TServiceResource[]
}): TreeDataNode[] => {
  const addressGroupsByKey = Object.fromEntries(
    (addressGroups || []).map(addressGroup => [
      buildNamespacedValue({
        namespace: addressGroup.metadata.namespace,
        name: addressGroup.metadata.name,
      }),
      addressGroup,
    ]),
  )

  return selectedAddressGroupValues.map(selectedValue => {
    const parsedValue = parseNamespacedValue(selectedValue)
    const addressGroup = addressGroupsByKey[selectedValue]
    const relatedHostBindings = (hostBindings || []).filter(binding =>
      isBindingRelatedToSelectedAddressGroups(binding, [selectedValue]),
    )
    const relatedNetworkBindings = (networkBindings || []).filter(binding =>
      isBindingRelatedToSelectedAddressGroups(binding, [selectedValue]),
    )
    const relatedServiceBindings = (serviceBindings || []).filter(binding =>
      isBindingRelatedToSelectedAddressGroups(binding, [selectedValue]),
    )

    const branches = buildAddressGroupContentsTree({
      addressGroupName: parsedValue.name,
      addressGroupNamespace: parsedValue.namespace,
      hostBindings: relatedHostBindings,
      networkBindings: relatedNetworkBindings,
      serviceBindings: relatedServiceBindings,
      hosts,
      networks,
      services,
    })

    return {
      title: buildOverviewTitle(
        addressGroup,
        selectedValue,
        relatedHostBindings.length + relatedNetworkBindings.length + relatedServiceBindings.length,
      ),
      key: `overview-${selectedValue}`,
      children: branches,
    }
  })
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

const patchEditableSpec = async (endpoint: string, service: TServiceResource, values: TServiceFormValues) => {
  const patchRequests: Promise<unknown>[] = []

  ;(
    [
      ['displayName', normalizeOptionalString(values.displayName)],
      ['description', normalizeOptionalString(values.description)],
      ['comment', normalizeOptionalString(values.comment)],
    ] as const
  ).forEach(([fieldName, nextValue]) => {
    const currentValue = normalizeOptionalString(service.spec?.[fieldName])

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

  const nextTransports = buildServiceTransports(values.transportEntries)
  const currentTransports = normalizeServiceTransports(service.spec?.transports)

  if (JSON.stringify(nextTransports) !== JSON.stringify(currentTransports)) {
    if (nextTransports.length === 0) {
      patchRequests.push(
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: '/spec/transports',
        }),
      )
    } else {
      patchRequests.push(
        patchEntryWithReplaceOp({
          endpoint,
          pathToValue: '/spec/transports',
          body: nextTransports,
        }),
      )
    }
  }

  await Promise.all(patchRequests)

  return patchRequests.length
}

const syncAddressGroupBindings = async (
  cluster: string,
  serviceIdentifier: { name: string; namespace: string },
  values: TServiceFormValues,
  currentBindings: TServiceBindingResource[],
) => {
  const requestedAddressGroups = new Set(values.addressGroups || [])
  const currentAddressGroups = new Set(
    currentBindings
      .map(binding => getBindingLookupKey(binding.spec?.addressGroup))
      .filter((value): value is string => Boolean(value)),
  )

  const createBindings = [...requestedAddressGroups]
    .filter(resourceValue => !currentAddressGroups.has(resourceValue))
    .map(resourceValue => {
      const addressGroup = parseNamespacedValue(resourceValue)

      return createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'servicebindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'ServiceBinding',
          metadata: {
            name: buildBindingName(values.name, addressGroup.namespace, addressGroup.name),
            namespace: values.namespace,
          },
          spec: {
            addressGroup,
            service: serviceIdentifier,
            description: values.description,
            comment: values.comment,
          },
        },
      })
    })

  const deleteBindings = currentBindings
    .filter(binding => {
      const addressGroupValue = getBindingLookupKey(binding.spec?.addressGroup)

      if (!addressGroupValue || !binding.metadata.name) {
        return false
      }

      return !requestedAddressGroups.has(addressGroupValue)
    })
    .map(binding =>
      deleteEntry({
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'servicebindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const requests = [...createBindings, ...deleteBindings]

  await Promise.all(requests)

  return requests.length
}

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
    await form.validateFields([
      ['namespace'],
      ['name'],
      ['displayName'],
      ['addressGroups'],
      ['description'],
      ['comment'],
      ['transportEntries'],
    ])
    const values = form.getFieldsValue(true) as TServiceFormValues
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
              <Header>{renderBadgeWithValue('Service', 'Service')}</Header>
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
                  <Form.Item name="displayName" label="Display name">
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
                                  rules={[{ required: true, message: 'Select IP family' }]}
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
                                  rules={[{ required: true, message: 'Select protocol' }]}
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
                        <PortsActions>
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
                        </PortsActions>
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
                {!isOverviewLoading && selectedAddressGroups.length === 0 && (
                  <OverviewEmpty>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                  </OverviewEmpty>
                )}
                {!isOverviewLoading && selectedAddressGroups.length > 0 && (
                  <TreeContainer>
                    <Tree showLine switcherIcon={<CaretDownOutlined />} defaultExpandAll treeData={overviewTreeData} />
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
