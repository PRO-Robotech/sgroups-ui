import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Empty, Form, Input, message, Modal, Select, Spin, Switch } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { createNewEntry, TSingleResource, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import {
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { renderBadgeWithValue } from 'utils'
import { TAddressGroupFormModalProps, TAddressGroupFormValues } from './types'
import {
  API_GROUP,
  API_RESOURCE_VERSION,
  API_VERSION,
  buildCurrentBindings,
  compactSpec,
  getApiEndpoint,
  getBindingLookupKey,
  getNamespacedResourceOptions,
  getResourceOptions,
  NAME_PATTERN,
  parseNamespacedValue,
  patchEditableSpec,
  renderResourceOptionLabel,
  syncBindings,
} from './utils'
import { Styled } from './styled'

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
    if (!open) {
      didApplyEditPrefillRef.current = false
      didApplyCreatePrefillRef.current = false
      setIsInitialized(false)
    }
  }, [open])

  useEffect(() => {
    if (
      !open ||
      !addressGroup ||
      !effectiveAddressGroupNamespace ||
      isFormResourcesLoading ||
      didApplyEditPrefillRef.current
    ) {
      return
    }

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
      return
    }

    didApplyCreatePrefillRef.current = true
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
      return
    }

    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    form.resetFields()
    setIsSubmitting(false)
  }, [form, open])

  const handleCancel = () => {
    didApplyEditPrefillRef.current = false
    didApplyCreatePrefillRef.current = false
    setIsInitialized(false)
    form.resetFields()
    setIsSubmitting(false)
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
        const changedBindingsCount = await syncBindings(cluster, addressGroupIdentifier, values, currentBindings)

        if (changedFieldsCount > 0 || changedBindingsCount > 0) {
          await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
          message.success('Address group updated')
        } else {
          message.info('No changes to save')
        }

        handleCancel()
        return
      }

      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'addressgroups'),
        body: addressGroupBody,
      })

      await syncBindings(cluster, addressGroupIdentifier, values, { hosts: [], services: [], networks: [] })
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
      afterClose={() => {
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
              <Styled.Header>{renderBadgeWithValue('Address Group', 'Address group')}</Styled.Header>
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
                <Styled.SwitchRow>
                  <span>Allow access</span>
                  <Form.Item name="allowAccess" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </Styled.SwitchRow>
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
            </Styled.FormColumn>
            <Styled.Overview>
              <Styled.OverviewTitle>Structure Overview</Styled.OverviewTitle>
              <Styled.OverviewBody>
                {selectedItemsCount === 0 ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
                ) : (
                  <Styled.OverviewTree>
                    <Styled.OverviewGroup>
                      <Styled.OverviewGroupTitle>
                        Address group <Styled.Count>{selectedItemsCount}</Styled.Count>
                      </Styled.OverviewGroupTitle>
                      <Styled.OverviewBranch>
                        <Styled.OverviewBranchTitle>
                          Hosts <Styled.Count>{selectedHosts.length}</Styled.Count>
                        </Styled.OverviewBranchTitle>
                        {selectedHosts.map(value => (
                          <Styled.OverviewLeaf key={`host-${value}`}>
                            {renderResourceOptionLabel('Host', value)}
                          </Styled.OverviewLeaf>
                        ))}
                        <Styled.OverviewBranchTitle>
                          Networks <Styled.Count>{selectedNetworks.length}</Styled.Count>
                        </Styled.OverviewBranchTitle>
                        {selectedNetworks.map(value => (
                          <Styled.OverviewLeaf key={`network-${value}`}>
                            {renderResourceOptionLabel('Network', value)}
                          </Styled.OverviewLeaf>
                        ))}
                        <Styled.OverviewBranchTitle>
                          Services <Styled.Count>{parsedSelectedServices.length}</Styled.Count>
                        </Styled.OverviewBranchTitle>
                        {parsedSelectedServices.map(service => (
                          <Styled.OverviewLeaf key={`service-${service.namespace}-${service.name}`}>
                            {renderResourceOptionLabel('Service', `${service.namespace} / ${service.name}`)}
                          </Styled.OverviewLeaf>
                        ))}
                      </Styled.OverviewBranch>
                    </Styled.OverviewGroup>
                  </Styled.OverviewTree>
                )}
              </Styled.OverviewBody>
            </Styled.Overview>
          </>
        )}
      </Styled.ModalContent>
    </Modal>
  )
}
