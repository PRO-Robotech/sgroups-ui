import React, { FC, useEffect, useMemo, useState } from 'react'
import { Empty, Form, Input, message, Modal, Select, Switch } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import {
  createNewEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
  TSingleResource,
  useK8sSmartResource,
} from '@prorobotech/openapi-k8s-toolkit'
import { TAddressGroupResource } from 'components/organisms/AddressGroups/tableConfig'
import { THostResource, TNetworkResource, TServiceResource } from 'localTypes'
import { renderBadgeWithValue } from 'utils'
import {
  Count,
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

const getRefsByKind = (addressGroup: TAddressGroupResource | null | undefined, kind: string) =>
  (addressGroup?.refs || [])
    .filter(ref => (ref.kind || ref.resType) === kind && ref.name)
    .map(ref => (kind === 'Service' && ref.namespace ? `${ref.namespace}/${ref.name}` : ref.name))
    .filter((value): value is string => Boolean(value))

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

export const AddressGroupFormModal: FC<TAddressGroupFormModalProps> = ({
  cluster,
  namespace,
  open,
  addressGroup,
  onClose,
}) => {
  const [form] = Form.useForm<TAddressGroupFormValues>()
  const queryClient = useQueryClient()
  const selectedNamespace = Form.useWatch('namespace', form)
  const selectedHostsRaw = Form.useWatch('hosts', form)
  const selectedServicesRaw = Form.useWatch('services', form)
  const selectedNetworksRaw = Form.useWatch('networks', form)
  const selectedHosts = useMemo(() => selectedHostsRaw || [], [selectedHostsRaw])
  const selectedServices = useMemo(() => selectedServicesRaw || [], [selectedServicesRaw])
  const selectedNetworks = useMemo(() => selectedNetworksRaw || [], [selectedNetworksRaw])
  const effectiveAddressGroupNamespace = selectedNamespace || namespace
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

  const namespaceOptions = useMemo(
    () =>
      (tenantsData?.items || [])
        .map(item => item.metadata?.name)
        .filter((value): value is string => Boolean(value))
        .sort((first, second) => first.localeCompare(second))
        .map(value => ({ value, label: value })),
    [tenantsData?.items],
  )
  const parsedSelectedServices = useMemo(() => selectedServices.map(parseNamespacedValue), [selectedServices])
  const selectedItemsCount = selectedHosts.length + selectedServices.length + selectedNetworks.length

  useEffect(() => {
    if (!open || !addressGroup) {
      return
    }

    form.setFieldsValue({
      namespace: addressGroup?.metadata.namespace || namespace,
      name: addressGroup?.metadata.name,
      displayName: addressGroup?.spec?.displayName,
      allowAccess: addressGroup?.spec?.defaultAction === 'Allow',
      description: addressGroup?.spec?.description,
      comment: addressGroup?.spec?.comment,
      hosts: getRefsByKind(addressGroup, 'Host'),
      services: getRefsByKind(addressGroup, 'Service'),
      networks: getRefsByKind(addressGroup, 'Network'),
    })
  }, [addressGroup, form, namespace, open])

  useEffect(() => {
    if (!open || addressGroup) {
      return
    }

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
  }, [addressGroup, form, namespace, open])

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

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
        const changedFieldsCount = await patchEditableSpec(
          `${getApiEndpoint(cluster, values.namespace, 'addressgroups')}/${values.name}`,
          addressGroup,
          values,
        )

        if (changedFieldsCount > 0) {
          await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        }

        message.success('Address group updated')
        handleCancel()
        return
      }

      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'addressgroups'),
        body: addressGroupBody,
      })

      const createHostBindings = (values.hosts || []).map(resourceName =>
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

      const createServiceBindings = (values.services || []).map(resourceValue => {
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

      const createNetworkBindings = (values.networks || []).map(resourceName =>
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

      await Promise.all([...createHostBindings, ...createServiceBindings, ...createNetworkBindings])
      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      message.success('Address group created')
      handleCancel()
    } catch (error) {
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} address group: ${String(error)}`)
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
      okText="Save"
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      width={728}
      destroyOnClose
    >
      <ModalContent>
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
                disabled={isEditMode || !effectiveAddressGroupNamespace}
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
                disabled={isEditMode}
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
                disabled={isEditMode || !effectiveAddressGroupNamespace}
              />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input placeholder="Briefly describe the address group's purpose" />
            </Form.Item>
            <Form.Item name="comment" label="Comment">
              <Input.TextArea placeholder="Add any additional notes here..." autoSize={{ minRows: 2, maxRows: 4 }} />
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
      </ModalContent>
    </Modal>
  )
}
