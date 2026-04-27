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
  TNetworkResource,
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
} from 'utils'
import { THostFormModalProps, THostFormValues } from './types'
import { buildCurrentBindings, buildOverviewTreeData, patchEditableSpec, syncAddressGroupBindings } from './utils'
import { Styled } from './styled'

const DISPLAY_NAME_MAX_LENGTH = 63

const isFormValidationError = (error: unknown): error is { errorFields: unknown[] } =>
  Boolean(error && typeof error === 'object' && 'errorFields' in error)

export const HostFormModal: FC<THostFormModalProps> = ({ cluster, namespace, open, host, onClose }) => {
  const [form] = Form.useForm<THostFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const didApplyEditPrefillRef = useRef(false)
  const didApplyCreatePrefillRef = useRef(false)
  const queryClient = useQueryClient()
  const formValues = Form.useWatch([], form) as THostFormValues | undefined
  const selectedAddressGroups = useMemo(() => formValues?.addressGroups || [], [formValues?.addressGroups])
  const isEditMode = Boolean(host)

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
    () => buildCurrentBindings(host, hostBindingsData?.items),
    [host, hostBindingsData?.items],
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

    if (host && !isFormResourcesLoading && !didApplyEditPrefillRef.current) {
      didApplyEditPrefillRef.current = true
      form.setFieldsValue({
        namespace: host.metadata.namespace || namespace,
        name: host.metadata.name,
        displayName: host.spec?.displayName,
        description: host.spec?.description,
        comment: host.spec?.comment,
        addressGroups: currentBindings
          .map(binding => buildNamespacedValue(binding.spec?.addressGroup))
          .filter((value): value is string => Boolean(value)),
      })
      setIsInitialized(true)
      return
    }

    if (!host && !isFormResourcesLoading && !didApplyCreatePrefillRef.current) {
      didApplyCreatePrefillRef.current = true
      form.setFieldsValue({
        namespace,
        name: undefined,
        displayName: undefined,
        addressGroups: [],
        description: undefined,
        comment: undefined,
      })
      setIsInitialized(true)
    }
  }, [currentBindings, form, host, isFormResourcesLoading, namespace, open])

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
        ['addressGroups'],
        ['description'],
        ['comment'],
      ])
      const values = form.getFieldsValue(true) as THostFormValues
      setIsSubmitting(true)

      const hostIdentifier = {
        name: values.name,
        namespace: values.namespace,
      }
      const hostBody = {
        apiVersion: host?.apiVersion || API_RESOURCE_VERSION,
        kind: host?.kind || 'Host',
        metadata: host
          ? {
              ...host.metadata,
              name: values.name,
              namespace: values.namespace,
            }
          : {
              name: values.name,
              namespace: values.namespace,
            },
        spec: compactSpec({
          displayName: normalizeOptionalString(values.displayName),
          description: normalizeOptionalString(values.description),
          comment: normalizeOptionalString(values.comment),
        }),
      }

      if (host) {
        const hostEndpoint = `${getApiEndpoint(cluster, values.namespace, 'hosts')}/${values.name}`
        const changedFieldsCount = await patchEditableSpec(hostEndpoint, host, values)
        const changedBindingsCount = await syncAddressGroupBindings(cluster, hostIdentifier, values, currentBindings)

        if (changedFieldsCount === 0 && changedBindingsCount === 0) {
          message.info('No changes to save')
          handleCancel()
          return
        }

        await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
        message.success('Host updated')
        handleCancel()
        return
      }

      await createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'hosts'),
        body: hostBody,
      })

      await syncAddressGroupBindings(cluster, hostIdentifier, values, [])
      await queryClient.invalidateQueries({ queryKey: ['k8s-list'] })
      message.success('Host created')
      handleCancel()
    } catch (error) {
      if (isFormValidationError(error)) {
        return
      }

      message.error(`Failed to ${isEditMode ? 'update' : 'create'} host: ${String(error)}`)
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
      width={728}
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
              <Styled.Header>{renderBadgeWithValue('Host', 'Host')}</Styled.Header>
              <Form<THostFormValues> form={form} layout="vertical" requiredMark>
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
                <Form.Item
                  name="displayName"
                  label="Display name"
                  rules={[
                    {
                      max: DISPLAY_NAME_MAX_LENGTH,
                      message: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less`,
                    },
                  ]}
                >
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
                <Form.Item name="description" label="Description">
                  <Input placeholder="Briefly describe the host's purpose" />
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
