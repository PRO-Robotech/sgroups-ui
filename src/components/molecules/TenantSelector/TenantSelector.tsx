import React, { FC, useEffect, useMemo, useState } from 'react'
import { Alert, Flex, Select, Typography } from 'antd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useK8sSmartResource, TSingleResource } from '@prorobotech/openapi-k8s-toolkit'
import { getNamespaceOptions } from 'utils'

type TTenantSelectorProps = {
  cluster?: string
  tenant?: string
}

const ALL_TENANTS = '__all_tenants__'

export const TenantSelector: FC<TTenantSelectorProps> = ({ cluster, tenant }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const [selectedTenant, setSelectedTenant] = useState<string | undefined>(tenant)

  const {
    data: tenantsData,
    isLoading,
    error,
  } = useK8sSmartResource<{
    items: Array<TSingleResource & { spec?: { displayName?: string } }>
  }>({
    cluster: cluster || '',
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'tenants',
    isEnabled: Boolean(cluster),
  })

  useEffect(() => {
    setSelectedTenant(tenant)
  }, [tenant])

  const options = useMemo(
    () => [{ value: ALL_TENANTS, label: 'All Tenants' }, ...getNamespaceOptions(tenantsData?.items)],
    [tenantsData],
  )

  const handleTenantChange = (value: string) => {
    const nextTenant = value === ALL_TENANTS ? undefined : value
    setSelectedTenant(nextTenant)

    const parts = window.location.pathname.split('/').filter(Boolean)
    const clusterParam = params.cluster

    if (!clusterParam) {
      return
    }

    const clusterIndex = parts.indexOf(clusterParam)
    if (clusterIndex === -1) {
      return
    }

    const namespaceIndex = clusterIndex + 1
    const hasNamespace = Boolean(params.namespace)
    const nextParts = [...parts]

    if (nextTenant) {
      if (hasNamespace) {
        nextParts[namespaceIndex] = nextTenant
      } else {
        nextParts.splice(namespaceIndex, 0, nextTenant)
      }
    } else if (hasNamespace) {
      nextParts.splice(namespaceIndex, 1)
    }

    navigate(`/${nextParts.join('/')}${location.search}`)
  }

  return (
    <Flex vertical gap={8}>
      <Flex gap={12} align="center" wrap>
        <Typography.Text>Tenant:</Typography.Text>
        <Select
          showSearch
          placeholder="Tenant"
          optionFilterProp="searchText"
          options={options}
          value={selectedTenant || ALL_TENANTS}
          onChange={handleTenantChange}
          loading={isLoading}
          disabled={!cluster}
          style={{ minWidth: 260 }}
        />
      </Flex>
      {error && <Alert type="error" title={`Failed to load tenants: ${String(error)}`} showIcon />}
    </Flex>
  )
}
