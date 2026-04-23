import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined } from '@ant-design/icons'
import { Empty, Form, Input, message, Modal, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { createNewEntry, TSingleResource, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import {
  API_GROUP,
  API_RESOURCE_VERSION,
  API_VERSION,
  buildNamespacedValue,
  compactSpec,
  getAddressGroupOptions,
  getApiEndpoint,
  getNamespaceOptions,
  NAME_PATTERN,
  normalizeOptionalString,
  renderBadgeWithValue,
  validateCIDR,
} from 'utils'
import { TNetworkResource } from '../../tableConfig'
import { TNetworkFormModalProps, TNetworkFormValues } from './types'
import { buildCurrentBindings, buildOverviewTreeData, patchEditableSpec, syncAddressGroupBindings } from './utils'
import { Styled } from './styled'

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

  const namespaceOptions = useMemo(() => getNamespaceOptions(tenantsData?.items), [tenantsData?.items])
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
              <Styled.Header>{renderBadgeWithValue('Network', 'Network')}</Styled.Header>
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
