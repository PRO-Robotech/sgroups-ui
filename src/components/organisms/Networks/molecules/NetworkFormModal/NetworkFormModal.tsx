import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined } from '@ant-design/icons'
import { Empty, Form, Input, message, Modal, Select, Spin, Tree } from 'antd'
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
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { renderBadgeWithValue } from 'utils'
import { TNetworkResource, TNetworkRow } from '../../tableConfig'
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
  TreeContainer,
} from './styled'

const API_GROUP = 'sgroups.io'
const API_VERSION = 'v1alpha1'
const API_RESOURCE_VERSION = `${API_GROUP}/${API_VERSION}`
const NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const HEX_GROUP_PATTERN = /^[0-9a-f]{1,4}$/i

type TNetworkFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  network?: TNetworkRow | null
  onClose: () => void
}

type TNetworkFormValues = {
  namespace: string
  name: string
  displayName?: string
  addressGroups?: string[]
  cidr: string
  description?: string
  comment?: string
}

type TResourceOption = {
  value: string
  label: React.ReactNode
  searchText: string
}

const getApiEndpoint = (cluster: string, namespaceValue: string, plural: string) =>
  `/api/clusters/${cluster}/k8s/apis/${API_GROUP}/${API_VERSION}/namespaces/${namespaceValue}/${plural}`

const compactSpec = (spec: Record<string, string | undefined>) =>
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

const buildBindingName = (networkName: string, addressGroupNamespace: string, addressGroupName: string) =>
  sanitizeBindingName(`${networkName}-ag-${addressGroupNamespace}-${addressGroupName}`)

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

const isSameNetwork = (
  resource: TNetworkResource | null | undefined,
  networkRef?: { name?: string; namespace?: string },
) => networkRef?.name === resource?.metadata.name && networkRef?.namespace === resource?.metadata.namespace

const buildCurrentBindings = (network: TNetworkResource | null | undefined, bindings?: TNetworkBindingResource[]) =>
  (bindings || []).filter(binding => isSameNetwork(network, binding.spec?.network))

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

const patchEditableSpec = async (endpoint: string, currentNetwork: TNetworkResource, values: TNetworkFormValues) => {
  const patchRequests: Promise<unknown>[] = []
  const nextCidr = values.cidr.trim()
  const currentCidr = currentNetwork.spec?.CIDR?.trim()

  if (nextCidr !== currentCidr) {
    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/CIDR',
        body: nextCidr,
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
    const currentValue = normalizeOptionalString(currentNetwork.spec?.[fieldName])

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

const syncAddressGroupBindings = async (
  cluster: string,
  networkIdentifier: { name: string; namespace: string },
  values: TNetworkFormValues,
  currentBindings: TNetworkBindingResource[],
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
        endpoint: getApiEndpoint(cluster, values.namespace, 'networkbindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'NetworkBinding',
          metadata: {
            name: buildBindingName(values.name, addressGroup.namespace, addressGroup.name),
            namespace: values.namespace,
          },
          spec: {
            addressGroup,
            network: networkIdentifier,
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
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'networkbindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const requests = [...createBindings, ...deleteBindings]

  await Promise.all(requests)

  return requests.length
}

const buildOverviewTitle = (addressGroup?: TAddressGroupResource, value?: string, bindingsCount?: number) => {
  const parsedValue = value ? parseNamespacedValue(value) : undefined
  const displayName = addressGroup?.spec?.displayName || addressGroup?.metadata.name || parsedValue?.name || 'Unknown'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {renderAddressGroupOptionLabel(displayName)}
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
    const relatedHostBindings = (hostBindings || []).filter(
      binding => buildNamespacedValue(binding.spec?.addressGroup) === selectedValue,
    )
    const relatedNetworkBindings = (networkBindings || []).filter(
      binding => buildNamespacedValue(binding.spec?.addressGroup) === selectedValue,
    )
    const relatedServiceBindings = (serviceBindings || []).filter(
      binding => buildNamespacedValue(binding.spec?.addressGroup) === selectedValue,
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

export const NetworkFormModal: FC<TNetworkFormModalProps> = ({ cluster, namespace, open, network, onClose }) => {
  const [form] = Form.useForm<TNetworkFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const formValues = Form.useWatch([], form) as TNetworkFormValues | undefined
  const selectedAddressGroups = useMemo(() => formValues?.addressGroups || [], [formValues?.addressGroups])
  const isEditMode = Boolean(network)

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
    () => buildCurrentBindings(network, networkBindingsData?.items),
    [network, networkBindingsData?.items],
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

    if (network && !isFormResourcesLoading && !didApplyEditPrefillRef.current) {
      didApplyEditPrefillRef.current = true
      form.setFieldsValue({
        namespace: network.metadata.namespace || namespace,
        name: network.metadata.name,
        displayName: network.spec?.displayName,
        cidr: network.spec?.CIDR,
        description: network.spec?.description,
        comment: network.spec?.comment,
        addressGroups: currentBindings
          .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
          .filter((value): value is string => Boolean(value)),
      })
      setIsInitialized(true)
      return
    }

    if (!network && !isFormResourcesLoading && !didApplyCreatePrefillRef.current) {
      didApplyCreatePrefillRef.current = true
      form.setFieldsValue({
        namespace,
        name: undefined,
        displayName: undefined,
        addressGroups: [],
        cidr: undefined,
        description: undefined,
        comment: undefined,
      })
      setIsInitialized(true)
    }
  }, [currentBindings, form, isFormResourcesLoading, namespace, network, open])

  useEffect(() => {
    if (open) {
      return
    }

    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    setIsSubmitting(false)
    form.resetFields()
  }, [form, open])

  const handleCancel = () => {
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
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
      ['cidr'],
      ['description'],
      ['comment'],
    ])
    const values = form.getFieldsValue(true) as TNetworkFormValues
    setIsSubmitting(true)

    try {
      const networkIdentifier = {
        name: values.name,
        namespace: values.namespace,
      }
      const networkBody = {
        apiVersion: network?.apiVersion || API_RESOURCE_VERSION,
        kind: network?.kind || 'Network',
        metadata: network
          ? {
              ...network.metadata,
              name: values.name,
              namespace: values.namespace,
            }
          : {
              name: values.name,
              namespace: values.namespace,
            },
        spec: compactSpec({
          CIDR: values.cidr.trim(),
          displayName: normalizeOptionalString(values.displayName),
          description: normalizeOptionalString(values.description),
          comment: normalizeOptionalString(values.comment),
        }),
      }

      if (network) {
        const networkEndpoint = `${getApiEndpoint(cluster, values.namespace, 'networks')}/${values.name}`
        const changedFieldsCount = await patchEditableSpec(networkEndpoint, network, values)
        const changedBindingsCount = await syncAddressGroupBindings(cluster, networkIdentifier, values, currentBindings)

        if (changedFieldsCount === 0 && changedBindingsCount === 0) {
          message.info('No changes to save')
          handleCancel()
          return
        }

        await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        message.success('Network updated')
        handleCancel()
        return
      }

      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'networks'),
        body: networkBody,
      })

      await syncAddressGroupBindings(cluster, networkIdentifier, values, [])
      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      message.success('Network created')
      handleCancel()
    } catch (error) {
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} network: ${String(error)}`)
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
              <Header>{renderBadgeWithValue('Network', 'Network')}</Header>
              <Form<TNetworkFormValues> form={form} layout="vertical" requiredMark>
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
                  <Input placeholder="e.g. server-01.prod" />
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
                <Form.Item
                  name="cidr"
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
                <Form.Item name="description" label="Description">
                  <Input placeholder="Briefly describe the network's purpose" />
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
