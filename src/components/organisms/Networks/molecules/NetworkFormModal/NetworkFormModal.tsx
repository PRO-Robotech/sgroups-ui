import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CaretDownOutlined } from '@ant-design/icons'
import { Empty, Form, Input, message, Modal, Select, Spin, Tree } from 'antd'
import type { TreeDataNode } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { createNewEntry, TSingleResource, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { v4 as uuidv4 } from 'uuid'
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
  EditableResourceTitle,
  renderBadgeWithValue,
  validateDisplayName,
  validateNetworkCIDR,
} from 'utils'
import { TNetworkResource } from '../../tableConfig'
import { TNetworkFormModalProps, TNetworkFormValues } from './types'
import { buildCurrentBindings, buildOverviewTreeData, patchEditableSpec, syncAddressGroupBindings } from './utils'
import { Styled } from './styled'

const DISPLAY_NAME_MAX_LENGTH = 63
const CREATE_DISPLAY_NAME_PREFIX = 'networks-'
const getCreateDisplayName = () => `${CREATE_DISPLAY_NAME_PREFIX}${Math.floor(100000 + Math.random() * 900000)}`
const isFormValidationError = (error: unknown): error is { errorFields: unknown[] } =>
  Boolean(error && typeof error === 'object' && 'errorFields' in error)

export const NetworkFormModal: FC<TNetworkFormModalProps> = ({ cluster, namespace, open, network, onClose }) => {
  const [form] = Form.useForm<TNetworkFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const selectedAddressGroupNamespaceValue = Form.useWatch('addressGroupNamespace', form)
  const selectedAddressGroupsValue = Form.useWatch('addressGroups', form)
  const selectedAddressGroups = useMemo(() => selectedAddressGroupsValue || [], [selectedAddressGroupsValue])
  const isEditMode = Boolean(network)
  const modalTitle = network?.spec?.displayName || network?.metadata.name || 'Network'
  const modalTitleFallback = network?.metadata.name || 'Network'
  const displayNameRules = [
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
    () => buildCurrentBindings(network, networkBindingsData?.items),
    [network, networkBindingsData?.items],
  )
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
  const selectedAddressGroupNamespace =
    selectedAddressGroupNamespaceValue ?? (!isInitialized ? network?.metadata.namespace || namespace : undefined)
  const addressGroups = useMemo(() => addressGroupsData?.items || [], [addressGroupsData?.items])
  const addressGroupOptions = useMemo(
    () => getAddressGroupOptions(addressGroups, { showNamespace: true }),
    [addressGroups],
  )
  const overviewKey = useMemo(
    () => `network-overview-${selectedAddressGroupNamespace || 'none'}-${selectedAddressGroups.join('|')}`,
    [selectedAddressGroupNamespace, selectedAddressGroups],
  )
  const addedAddressGroupValues = useMemo(() => {
    if (!network) {
      return []
    }

    const currentAddressGroups = new Set(
      currentBindings
        .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
        .filter((value): value is string => Boolean(value)),
    )

    return selectedAddressGroups.filter(value => !currentAddressGroups.has(value))
  }, [currentBindings, network, selectedAddressGroups])
  const overviewTreeData = useMemo<TreeDataNode[]>(
    () =>
      buildOverviewTreeData({
        addressGroups,
        selectedAddressGroupValues: selectedAddressGroups,
        hostBindings: hostBindingsData?.items,
        networkBindings: networkBindingsData?.items,
        serviceBindings: serviceBindingsData?.items,
        hosts: hostsData?.items,
        networks: networksData?.items,
        services: servicesData?.items,
        currentNetwork: network,
        addedAddressGroupValues,
      }),
    [
      addedAddressGroupValues,
      hostBindingsData?.items,
      hostsData?.items,
      network,
      networkBindingsData?.items,
      networksData?.items,
      addressGroups,
      selectedAddressGroups,
      serviceBindingsData?.items,
      servicesData?.items,
    ],
  )
  const isOverviewLoading =
    !isInitialized &&
    (isAddressGroupsLoading ||
      isHostBindingsLoading ||
      isNetworkBindingsLoading ||
      isServiceBindingsLoading ||
      isHostsLoading ||
      isNetworksLoading ||
      isServicesLoading)
  const isFormResourcesLoading =
    isTenantsLoading || Boolean(network && (isNetworkBindingsLoading || isAddressGroupsLoading))
  const isInitialLoadPending = open && !isInitialized
  const isModalInitializing = !isInitialized && (isFormResourcesLoading || isInitialLoadPending)

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
        addressGroupNamespace: network.metadata.namespace || namespace,
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
        name: uuidv4(),
        displayName: getCreateDisplayName(),
        addressGroupNamespace: namespace,
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
    try {
      await form.validateFields([
        ['namespace'],
        ['name'],
        ['displayName'],
        ['addressGroupNamespace'],
        ['addressGroups'],
        ['cidr'],
        ['description'],
        ['comment'],
      ])
    } catch (error) {
      if (isFormValidationError(error)) {
        return
      }

      message.error(`Failed to validate network form: ${String(error)}`)
      return
    }

    const formStoreValues = form.getFieldsValue(true) as TNetworkFormValues
    const values = formStoreValues
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
      mask={{ closable: false }}
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
              <Form<TNetworkFormValues> form={form} layout="vertical" requiredMark>
                <Styled.Header>
                  {isEditMode ? (
                    <EditableResourceTitle
                      fallbackName={modalTitleFallback}
                      kind="Network"
                      placeholder="e.g. server-01.prod"
                      rules={displayNameRules}
                    />
                  ) : (
                    renderBadgeWithValue('Network', modalTitle)
                  )}
                </Styled.Header>
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
                    optionFilterProp="searchText"
                    options={namespaceOptions}
                    loading={isTenantsLoading}
                    disabled={isEditMode}
                    status={tenantsError ? 'error' : undefined}
                    onChange={value => {
                      form.setFieldValue('addressGroupNamespace', value)
                      form.setFieldValue('addressGroups', [])
                    }}
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
                    <Input placeholder="e.g. server-01.prod" />
                  </Form.Item>
                )}
                <Form.Item name="addressGroupNamespace" hidden>
                  <Input />
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
                        if (!validateNetworkCIDR(value)) {
                          throw new Error('Use a valid network CIDR like 10.0.0.0/8 or 2001:db8::/64')
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
