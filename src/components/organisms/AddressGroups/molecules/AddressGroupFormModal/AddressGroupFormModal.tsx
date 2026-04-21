import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Empty, Form, Input, message, Modal, Select, Spin, Switch } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import {
  createNewEntry,
  deleteEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
  TSingleResource,
  useK8sSmartResource,
} from '@prorobotech/openapi-k8s-toolkit'
import { TAddressGroupResource } from 'components/organisms/AddressGroups/tableConfig'
import {
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { renderBadgeWithValue } from 'utils'
import {
  Count,
  LoadingState,
  ModalContent,
  FormColumn,
  Header,
  Overview,
  OverviewBody,
  OverviewBranch,
  OverviewBranchTitle,
  OverviewGroup,
  OverviewGroupTitle,
  OverviewLeaf,
  OverviewTitle,
  OverviewTree,
  SwitchRow,
} from './styled'

const debugAddressGroupModal = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log('[AddressGroupFormModal]', ...args)
}

const API_GROUP = 'sgroups.io'
const API_VERSION = 'v1alpha1'
const API_RESOURCE_VERSION = `${API_GROUP}/${API_VERSION}`
const NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/

type TAddressGroupFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  addressGroup?: TAddressGroupResource | null
  onClose: () => void
}

type TAddressGroupFormValues = {
  namespace: string
  name: string
  displayName?: string
  allowAccess?: boolean
  hosts?: string[]
  services?: string[]
  networks?: string[]
  description?: string
  comment?: string
}

type TSelectableResource = {
  metadata: {
    name?: string
    namespace?: string
  }
  spec?: {
    displayName?: string
  }
}

type TResourceOption = {
  value: string
  label: React.ReactNode
  searchText: string
}

type TCurrentBindings = {
  hosts: THostBindingResource[]
  services: TServiceBindingResource[]
  networks: TNetworkBindingResource[]
}

const getApiEndpoint = (cluster: string, namespace: string, plural: string) =>
  `/api/clusters/${cluster}/k8s/apis/${API_GROUP}/${API_VERSION}/namespaces/${namespace}/${plural}`

const compactSpec = (spec: Record<string, string | boolean | undefined>) =>
  Object.fromEntries(Object.entries(spec).filter(([, value]) => value !== undefined && value !== ''))

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

const buildBindingName = (addressGroupName: string, kind: 'host' | 'service' | 'network', resourceName: string) =>
  sanitizeBindingName(`${addressGroupName}-${kind}-${resourceName}`)

const renderResourceOptionLabel = (kind: 'Host' | 'Service' | 'Network', value: string) =>
  renderBadgeWithValue(kind, value)

const getResourceOptions = (kind: 'Host' | 'Network', items?: TSelectableResource[]): TResourceOption[] =>
  (items || [])
    .map(item => item.metadata.name)
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => first.localeCompare(second))
    .map(value => ({
      value,
      label: renderResourceOptionLabel(kind, value),
      searchText: value,
    }))

const getNamespacedResourceOptions = (items?: TSelectableResource[]): TResourceOption[] =>
  (items || [])
    .reduce<TResourceOption[]>((acc, item) => {
      const { name, namespace: resourceNamespace } = item.metadata

      if (!name || !resourceNamespace) {
        return acc
      }

      acc.push({
        value: `${resourceNamespace}/${name}`,
        label: renderResourceOptionLabel('Service', `${resourceNamespace} / ${name}`),
        searchText: `${resourceNamespace} ${name}`,
      })

      return acc
    }, [])
    .sort((first, second) => first.searchText.localeCompare(second.searchText))

const parseNamespacedValue = (value: string) => {
  const [resourceNamespace, ...nameParts] = value.split('/')

  return {
    namespace: resourceNamespace,
    name: nameParts.join('/'),
  }
}

const getBindingLookupKey = (resource?: { name?: string; namespace?: string }) =>
  resource?.name ? `${resource.namespace || ''}/${resource.name}` : null

const isSameAddressGroup = (
  resource: TAddressGroupResource | null | undefined,
  addressGroupRef?: { name?: string; namespace?: string },
) => addressGroupRef?.name === resource?.metadata.name && addressGroupRef?.namespace === resource?.metadata.namespace

const buildCurrentBindings = (
  addressGroup: TAddressGroupResource | null | undefined,
  hostBindings?: THostBindingResource[],
  serviceBindings?: TServiceBindingResource[],
  networkBindings?: TNetworkBindingResource[],
): TCurrentBindings => ({
  hosts: (hostBindings || []).filter(binding => isSameAddressGroup(addressGroup, binding.spec?.addressGroup)),
  services: (serviceBindings || []).filter(binding => isSameAddressGroup(addressGroup, binding.spec?.addressGroup)),
  networks: (networkBindings || []).filter(binding => isSameAddressGroup(addressGroup, binding.spec?.addressGroup)),
})

const patchEditableSpec = async (
  endpoint: string,
  addressGroup: TAddressGroupResource,
  values: TAddressGroupFormValues,
) => {
  const patchRequests: Promise<unknown>[] = []
  const nextDefaultAction = values.allowAccess ? 'Allow' : 'Deny'
  const currentDefaultAction = addressGroup.spec?.defaultAction || 'Deny'

  if (nextDefaultAction !== currentDefaultAction) {
    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/defaultAction',
        body: nextDefaultAction,
      }),
    )
  }

  ;(
    [
      ['displayName', normalizeOptionalString(values.displayName)],
      ['description', normalizeOptionalString(values.description)],
      ['comment', normalizeOptionalString(values.comment)],
    ] as const
  ).forEach(([fieldName, nextValue]) => {
    const currentValue = normalizeOptionalString(addressGroup.spec?.[fieldName])

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

  await Promise.all(patchRequests)

  return patchRequests.length
}

const syncBindings = async (
  cluster: string,
  addressGroupIdentifier: { name: string; namespace: string },
  values: TAddressGroupFormValues,
  currentBindings: TCurrentBindings,
) => {
  const requestedHosts = new Set(values.hosts || [])
  const requestedServices = new Set(values.services || [])
  const requestedNetworks = new Set(values.networks || [])

  const currentHostKeys = new Set(
    currentBindings.hosts.map(binding => binding.spec?.host?.name).filter(Boolean) as string[],
  )
  const currentServiceKeys = new Set(
    currentBindings.services
      .map(binding => getBindingLookupKey(binding.spec?.service))
      .filter((value): value is string => Boolean(value)),
  )
  const currentNetworkKeys = new Set(
    currentBindings.networks
      .map(binding => binding.spec?.network?.name)
      .filter((value): value is string => Boolean(value)),
  )

  const createHostBindings = [...requestedHosts]
    .filter(resourceName => !currentHostKeys.has(resourceName))
    .map(resourceName =>
      createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'hostbindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'HostBinding',
          metadata: {
            name: buildBindingName(values.name, 'host', resourceName),
            namespace: values.namespace,
          },
          spec: {
            addressGroup: addressGroupIdentifier,
            host: {
              name: resourceName,
              namespace: values.namespace,
            },
            description: values.description,
            comment: values.comment,
          },
        },
      }),
    )

  const createServiceBindings = [...requestedServices]
    .filter(resourceValue => !currentServiceKeys.has(resourceValue))
    .map(resourceValue => {
      const service = parseNamespacedValue(resourceValue)

      return createNewEntry({
        endpoint: getApiEndpoint(cluster, service.namespace, 'servicebindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'ServiceBinding',
          metadata: {
            name: buildBindingName(values.name, 'service', service.name),
            namespace: service.namespace,
          },
          spec: {
            addressGroup: addressGroupIdentifier,
            service: {
              name: service.name,
              namespace: service.namespace,
            },
            description: values.description,
            comment: values.comment,
          },
        },
      })
    })

  const createNetworkBindings = [...requestedNetworks]
    .filter(resourceName => !currentNetworkKeys.has(resourceName))
    .map(resourceName =>
      createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'networkbindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'NetworkBinding',
          metadata: {
            name: buildBindingName(values.name, 'network', resourceName),
            namespace: values.namespace,
          },
          spec: {
            addressGroup: addressGroupIdentifier,
            network: {
              name: resourceName,
              namespace: values.namespace,
            },
            description: values.description,
            comment: values.comment,
          },
        },
      }),
    )

  const deleteHostBindings = currentBindings.hosts
    .filter(binding => {
      const resourceName = binding.spec?.host?.name

      if (!resourceName || !binding.metadata.name) {
        return false
      }

      return !requestedHosts.has(resourceName)
    })
    .map(binding =>
      deleteEntry({
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'hostbindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const deleteServiceBindings = currentBindings.services
    .filter(binding => {
      const resourceKey = getBindingLookupKey(binding.spec?.service)

      if (!resourceKey || !binding.metadata.name) {
        return false
      }

      return !requestedServices.has(resourceKey)
    })
    .map(binding =>
      deleteEntry({
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'servicebindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const deleteNetworkBindings = currentBindings.networks
    .filter(binding => {
      const resourceName = binding.spec?.network?.name

      if (!resourceName || !binding.metadata.name) {
        return false
      }

      return !requestedNetworks.has(resourceName)
    })
    .map(binding =>
      deleteEntry({
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'networkbindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const requests = [
    ...createHostBindings,
    ...createServiceBindings,
    ...createNetworkBindings,
    ...deleteHostBindings,
    ...deleteServiceBindings,
    ...deleteNetworkBindings,
  ]

  await Promise.all(requests)

  return requests.length
}

export const AddressGroupFormModal: FC<TAddressGroupFormModalProps> = ({
  cluster,
  namespace,
  open,
  addressGroup,
  onClose,
}) => {
  const [form] = Form.useForm<TAddressGroupFormValues>()
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const selectedNamespace = Form.useWatch('namespace', form)
  const selectedHostsRaw = Form.useWatch('hosts', form)
  const selectedServicesRaw = Form.useWatch('services', form)
  const selectedNetworksRaw = Form.useWatch('networks', form)
  const selectedHosts = useMemo(() => selectedHostsRaw || [], [selectedHostsRaw])
  const selectedServices = useMemo(() => selectedServicesRaw || [], [selectedServicesRaw])
  const selectedNetworks = useMemo(() => selectedNetworksRaw || [], [selectedNetworksRaw])
  const effectiveAddressGroupNamespace = selectedNamespace || addressGroup?.metadata.namespace || namespace
  const isEditMode = Boolean(addressGroup)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    data: hostsData,
    isLoading: isHostsLoading,
    error: hostsError,
  } = useK8sSmartResource<{ items: THostResource[] }>({
    cluster,
    namespace: effectiveAddressGroupNamespace,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'hosts',
    isEnabled: open && Boolean(effectiveAddressGroupNamespace),
  })

  const {
    data: servicesData,
    isLoading: isServicesLoading,
    error: servicesError,
  } = useK8sSmartResource<{ items: TServiceResource[] }>({
    cluster,
    namespace: undefined,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'services',
    isEnabled: open,
  })

  const {
    data: networksData,
    isLoading: isNetworksLoading,
    error: networksError,
  } = useK8sSmartResource<{ items: TNetworkResource[] }>({
    cluster,
    namespace: effectiveAddressGroupNamespace,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'networks',
    isEnabled: open && Boolean(effectiveAddressGroupNamespace),
  })
  const { data: hostBindingsData, isLoading: isHostBindingsLoading } = useK8sSmartResource<{
    items: THostBindingResource[]
  }>({
    cluster,
    namespace: effectiveAddressGroupNamespace,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'hostbindings',
    isEnabled: open && Boolean(effectiveAddressGroupNamespace),
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
    namespace: effectiveAddressGroupNamespace,
    apiGroup: API_GROUP,
    apiVersion: API_VERSION,
    plural: 'networkbindings',
    isEnabled: open && Boolean(effectiveAddressGroupNamespace),
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
  const currentBindings = useMemo(
    () =>
      buildCurrentBindings(
        addressGroup,
        hostBindingsData?.items,
        serviceBindingsData?.items,
        networkBindingsData?.items,
      ),
    [addressGroup, hostBindingsData?.items, networkBindingsData?.items, serviceBindingsData?.items],
  )
  const parsedSelectedServices = useMemo(() => selectedServices.map(parseNamespacedValue), [selectedServices])
  const selectedItemsCount = selectedHosts.length + selectedServices.length + selectedNetworks.length
  const isNamespaceScopedResourcesLoading =
    Boolean(effectiveAddressGroupNamespace) &&
    (isHostsLoading || isNetworksLoading || isHostBindingsLoading || isNetworkBindingsLoading)
  const isFormResourcesLoading =
    isTenantsLoading || isServicesLoading || isServiceBindingsLoading || isNamespaceScopedResourcesLoading
  const isInitialLoadPending = open && !isInitialized
  const isModalInitializing = isFormResourcesLoading || isInitialLoadPending

  useEffect(() => {
    debugAddressGroupModal('mount', {
      open,
      namespace,
      addressGroup: addressGroup
        ? {
            name: addressGroup.metadata.name,
            namespace: addressGroup.metadata.namespace,
          }
        : null,
    })

    return () => {
      debugAddressGroupModal('unmount')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    debugAddressGroupModal('props changed', {
      open,
      namespace,
      effectiveAddressGroupNamespace,
      isEditMode,
      addressGroup: addressGroup
        ? {
            name: addressGroup.metadata.name,
            namespace: addressGroup.metadata.namespace,
          }
        : null,
    })
  }, [addressGroup, effectiveAddressGroupNamespace, isEditMode, namespace, open])

  useEffect(() => {
    if (!open) {
      didApplyEditPrefillRef.current = false
      didApplyCreatePrefillRef.current = false
      setIsInitialized(false)
    }
  }, [open])

  useEffect(() => {
    debugAddressGroupModal('watched values changed', {
      selectedNamespace,
      hosts: selectedHosts,
      services: selectedServices,
      networks: selectedNetworks,
    })
  }, [selectedHosts, selectedNamespace, selectedNetworks, selectedServices])

  useEffect(() => {
    debugAddressGroupModal('resource loading changed', {
      isTenantsLoading,
      isHostsLoading,
      isServicesLoading,
      isNetworksLoading,
      isHostBindingsLoading,
      isServiceBindingsLoading,
      isNetworkBindingsLoading,
      namespaceOptionsCount: namespaceOptions.length,
      hostsCount: hostsData?.items?.length || 0,
      servicesCount: servicesData?.items?.length || 0,
      networksCount: networksData?.items?.length || 0,
      currentBindings: {
        hosts: currentBindings.hosts.length,
        services: currentBindings.services.length,
        networks: currentBindings.networks.length,
      },
    })
  }, [
    currentBindings.hosts.length,
    currentBindings.networks.length,
    currentBindings.services.length,
    hostBindingsData?.items?.length,
    hostsData?.items?.length,
    isHostBindingsLoading,
    isHostsLoading,
    isNetworkBindingsLoading,
    isNetworksLoading,
    isServiceBindingsLoading,
    isServicesLoading,
    isTenantsLoading,
    namespaceOptions.length,
    networksData?.items?.length,
    serviceBindingsData?.items?.length,
    servicesData?.items?.length,
  ])

  useEffect(() => {
    if (
      !open ||
      !addressGroup ||
      !effectiveAddressGroupNamespace ||
      isFormResourcesLoading ||
      didApplyEditPrefillRef.current
    ) {
      debugAddressGroupModal('edit prefill skipped', {
        open,
        hasAddressGroup: Boolean(addressGroup),
        effectiveAddressGroupNamespace,
        isFormResourcesLoading,
        didApplyEditPrefill: didApplyEditPrefillRef.current,
      })
      return
    }

    debugAddressGroupModal('edit prefill setFieldsValue', {
      namespace: addressGroup?.metadata.namespace || namespace,
      name: addressGroup?.metadata.name,
      displayName: addressGroup?.spec?.displayName,
      allowAccess: addressGroup?.spec?.defaultAction === 'Allow',
      description: addressGroup?.spec?.description,
      comment: addressGroup?.spec?.comment,
      hosts: currentBindings.hosts.map(binding => binding.spec?.host?.name).filter(Boolean),
      services: currentBindings.services.map(binding => getBindingLookupKey(binding.spec?.service)).filter(Boolean),
      networks: currentBindings.networks.map(binding => binding.spec?.network?.name).filter(Boolean),
    })
    didApplyEditPrefillRef.current = true
    form.setFieldsValue({
      namespace: addressGroup?.metadata.namespace || namespace,
      name: addressGroup?.metadata.name,
      displayName: addressGroup?.spec?.displayName,
      allowAccess: addressGroup?.spec?.defaultAction === 'Allow',
      description: addressGroup?.spec?.description,
      comment: addressGroup?.spec?.comment,
      hosts: currentBindings.hosts
        .map(binding => binding.spec?.host?.name)
        .filter((value): value is string => Boolean(value)),
      services: currentBindings.services
        .map(binding => getBindingLookupKey(binding.spec?.service))
        .filter((value): value is string => Boolean(value)),
      networks: currentBindings.networks
        .map(binding => binding.spec?.network?.name)
        .filter((value): value is string => Boolean(value)),
    })
    setIsInitialized(true)
  }, [
    addressGroup,
    currentBindings.hosts,
    currentBindings.networks,
    currentBindings.services,
    form,
    effectiveAddressGroupNamespace,
    isFormResourcesLoading,
    namespace,
    open,
  ])

  useEffect(() => {
    if (!open || addressGroup || isFormResourcesLoading || didApplyCreatePrefillRef.current) {
      debugAddressGroupModal('create prefill skipped', {
        open,
        hasAddressGroup: Boolean(addressGroup),
        isFormResourcesLoading,
        didApplyCreatePrefill: didApplyCreatePrefillRef.current,
      })
      return
    }

    didApplyCreatePrefillRef.current = true
    debugAddressGroupModal('create prefill setFieldsValue', {
      namespace,
      allowAccess: false,
      hosts: [],
      services: [],
      networks: [],
    })
    form.setFieldsValue({
      namespace,
      name: undefined,
      displayName: undefined,
      description: undefined,
      comment: undefined,
      allowAccess: false,
      hosts: [],
      services: [],
      networks: [],
    })
    setIsInitialized(true)
  }, [addressGroup, form, isFormResourcesLoading, namespace, open])

  useEffect(() => {
    if (open) {
      debugAddressGroupModal('close reset skipped because modal is open')
      return
    }

    debugAddressGroupModal('close reset via effect')
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    form.resetFields()
    setIsSubmitting(false)
  }, [form, open])

  const handleCancel = () => {
    debugAddressGroupModal('handleCancel')
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    form.resetFields()
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    debugAddressGroupModal('handleSubmit validated values', values)

    setIsSubmitting(true)

    try {
      const addressGroupIdentifier = {
        name: values.name,
        namespace: values.namespace,
      }

      const addressGroupBody = {
        apiVersion: addressGroup?.apiVersion || API_RESOURCE_VERSION,
        kind: addressGroup?.kind || 'AddressGroup',
        metadata: addressGroup
          ? {
              ...addressGroup.metadata,
              name: values.name,
              namespace: values.namespace,
            }
          : {
              name: values.name,
              namespace: values.namespace,
            },
        spec: compactSpec({
          displayName: values.displayName,
          defaultAction: values.allowAccess ? 'Allow' : 'Deny',
          description: values.description,
          comment: values.comment,
          logs: addressGroup?.spec?.logs ?? false,
          trace: addressGroup?.spec?.trace ?? false,
        }),
      }

      if (addressGroup) {
        debugAddressGroupModal('edit submit start', {
          addressGroupIdentifier,
          currentBindings: {
            hosts: currentBindings.hosts.map(binding => binding.metadata.name),
            services: currentBindings.services.map(binding => binding.metadata.name),
            networks: currentBindings.networks.map(binding => binding.metadata.name),
          },
        })
        const changedFieldsCount = await patchEditableSpec(
          `${getApiEndpoint(cluster, values.namespace, 'addressgroups')}/${values.name}`,
          addressGroup,
          values,
        )
        const changedBindingsCount = await syncBindings(cluster, addressGroupIdentifier, values, currentBindings)

        if (changedFieldsCount > 0 || changedBindingsCount > 0) {
          await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        }

        message.success('Address group updated')
        debugAddressGroupModal('edit submit success', {
          changedFieldsCount,
          changedBindingsCount,
        })
        handleCancel()
        return
      }

      debugAddressGroupModal('create submit start', { addressGroupIdentifier })
      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'addressgroups'),
        body: addressGroupBody,
      })

      await syncBindings(cluster, addressGroupIdentifier, values, { hosts: [], services: [], networks: [] })
      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      message.success('Address group created')
      debugAddressGroupModal('create submit success')
      handleCancel()
    } catch (error) {
      debugAddressGroupModal('submit failed', error)
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} address group: ${String(error)}`)
    } finally {
      debugAddressGroupModal('submit finally')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      afterClose={() => {
        debugAddressGroupModal('afterClose')
        didApplyEditPrefillRef.current = false
        didApplyCreatePrefillRef.current = false
        setIsInitialized(false)
        form.resetFields()
        setIsSubmitting(false)
      }}
      onOk={handleSubmit}
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
              <Header>{renderBadgeWithValue('Address Group', 'Address group')}</Header>
              <Form<TAddressGroupFormValues> form={form} layout="vertical" requiredMark>
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
                    onChange={() => {
                      form.setFieldsValue({ hosts: [], networks: [] })
                    }}
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
                  <Input placeholder="e.g. server-01-prod" disabled={isEditMode} />
                </Form.Item>
                <Form.Item name="displayName" label="Display name">
                  <Input placeholder="e.g. server-01.prod" />
                </Form.Item>
                <SwitchRow>
                  <span>Allow access</span>
                  <Form.Item name="allowAccess" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </SwitchRow>
                <Form.Item name="hosts" label="Hosts" validateStatus={hostsError ? 'error' : undefined}>
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select hosts"
                    optionFilterProp="searchText"
                    options={getResourceOptions('Host', hostsData?.items)}
                    loading={isHostsLoading}
                    disabled={!effectiveAddressGroupNamespace}
                  />
                </Form.Item>
                <Form.Item name="services" label="Services" validateStatus={servicesError ? 'error' : undefined}>
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select services"
                    optionFilterProp="searchText"
                    options={getNamespacedResourceOptions(servicesData?.items)}
                    loading={isServicesLoading}
                  />
                </Form.Item>
                <Form.Item name="networks" label="Networks" validateStatus={networksError ? 'error' : undefined}>
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select networks"
                    optionFilterProp="searchText"
                    options={getResourceOptions('Network', networksData?.items)}
                    loading={isNetworksLoading}
                    disabled={!effectiveAddressGroupNamespace}
                  />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input placeholder="Briefly describe the address group's purpose" />
                </Form.Item>
                <Form.Item name="comment" label="Comment">
                  <Input.TextArea
                    placeholder="Add any additional notes here..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
              </Form>
            </FormColumn>
            <Overview>
              <OverviewTitle>Structure Overview</OverviewTitle>
              <OverviewBody>
                {selectedItemsCount === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                ) : (
                  <OverviewTree>
                    <OverviewGroup>
                      <OverviewGroupTitle>
                        Address group <Count>{selectedItemsCount}</Count>
                      </OverviewGroupTitle>
                      <OverviewBranch>
                        <OverviewBranchTitle>
                          Hosts <Count>{selectedHosts.length}</Count>
                        </OverviewBranchTitle>
                        {selectedHosts.map(value => (
                          <OverviewLeaf key={`host-${value}`}>{renderResourceOptionLabel('Host', value)}</OverviewLeaf>
                        ))}
                        <OverviewBranchTitle>
                          Networks <Count>{selectedNetworks.length}</Count>
                        </OverviewBranchTitle>
                        {selectedNetworks.map(value => (
                          <OverviewLeaf key={`network-${value}`}>
                            {renderResourceOptionLabel('Network', value)}
                          </OverviewLeaf>
                        ))}
                        <OverviewBranchTitle>
                          Services <Count>{parsedSelectedServices.length}</Count>
                        </OverviewBranchTitle>
                        {parsedSelectedServices.map(service => (
                          <OverviewLeaf key={`service-${service.namespace}-${service.name}`}>
                            {renderResourceOptionLabel('Service', `${service.namespace} / ${service.name}`)}
                          </OverviewLeaf>
                        ))}
                      </OverviewBranch>
                    </OverviewGroup>
                  </OverviewTree>
                )}
              </OverviewBody>
            </Overview>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
