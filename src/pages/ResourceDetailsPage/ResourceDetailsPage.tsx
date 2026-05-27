import React, { FC, useMemo } from 'react'
import { Alert, Empty, Typography } from 'antd'
import { DynamicComponents, TDynamicComponentsAppTypeMap, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { useParams } from 'react-router-dom'
import { SgroupsDropdownRedirect, SgroupsPageShell } from 'components/molecules'
import {
  SgroupsFactoryRenderer,
  SgroupsAddressGroupDetailsSection,
  SgroupsAddressGroupRulesTab,
  SgroupsHostDetailsSection,
  SgroupsNetworkDetailsSection,
  SgroupsServiceDetailsSection,
} from 'components/organisms'
import type { TSgroupsAddressGroupDetailsSectionData } from 'components/organisms/SgroupsAddressGroupDetailsSection'
import type { TSgroupsAddressGroupRulesTabData } from 'components/organisms/SgroupsAddressGroupRulesTab'
import type { TSgroupsHostDetailsSectionData } from 'components/organisms/SgroupsHostDetailsSection'
import type { TSgroupsNetworkDetailsSectionData } from 'components/organisms/SgroupsNetworkDetailsSection'
import type { TSgroupsServiceDetailsSectionData } from 'components/organisms/SgroupsServiceDetailsSection'
import { useTheme } from 'hooks/ThemeModeContext'
import { buildSgroupsResourceDetailsBreadcrumbs } from 'utils'
import { getPluginBasePath } from 'utils/getPluginBasePath'
import { buildNamespacedResourceDetailsFactory } from './buildNamespacedResourceDetailsFactory'
import {
  SGROUPS_RESOURCE_DETAILS_CONFIG,
  TSgroupsResourceDetailsConfig,
  TSgroupsResourcePlural,
} from './resourceDetailsConfig'

type TSgroupsDetailsResource = {
  metadata?: {
    name?: string
    namespace?: string
  }
  spec?: {
    displayName?: string
  }
}

type TResourceDetailsPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
  resourceConfig?: TSgroupsResourceDetailsConfig
}

export type TSgroupsResourceDetailsComponentMap = TDynamicComponentsAppTypeMap & {
  SgroupsAddressGroupDetailsSection: TSgroupsAddressGroupDetailsSectionData
  SgroupsAddressGroupRulesTab: TSgroupsAddressGroupRulesTabData
  SgroupsHostDetailsSection: TSgroupsHostDetailsSectionData
  SgroupsNetworkDetailsSection: TSgroupsNetworkDetailsSectionData
  SgroupsServiceDetailsSection: TSgroupsServiceDetailsSectionData
}

const isKnownResourcePlural = (value?: string): value is TSgroupsResourcePlural =>
  value ? value in SGROUPS_RESOURCE_DETAILS_CONFIG : false

export const ResourceDetailsPage: FC<TResourceDetailsPageProps> = ({ cluster, resourceConfig }) => {
  const { mode } = useTheme()
  const { name, namespace, plural } = useParams<{ name: string; namespace: string; plural?: string }>()
  const components = useMemo(
    () => ({
      ...DynamicComponents,
      DropdownRedirect: SgroupsDropdownRedirect,
      SgroupsAddressGroupDetailsSection,
      SgroupsAddressGroupRulesTab,
      SgroupsHostDetailsSection,
      SgroupsNetworkDetailsSection,
      SgroupsServiceDetailsSection,
    }),
    [],
  )

  const routeConfig = isKnownResourcePlural(plural) ? SGROUPS_RESOURCE_DETAILS_CONFIG[plural] : undefined
  const config = resourceConfig ?? routeConfig
  const clusterId = cluster ?? ''
  const resourceNamespace = namespace ?? ''
  const resourceName = name ?? ''
  const basePath = useMemo(() => getPluginBasePath(typeof window === 'undefined' ? '' : window.location.pathname), [])
  const { data: resourceData } = useK8sSmartResource<{ items?: TSgroupsDetailsResource[] }>({
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    cluster: clusterId,
    fieldSelector: `metadata.name=${resourceName}`,
    isEnabled: Boolean(clusterId && config && resourceNamespace && resourceName),
    namespace: resourceNamespace,
    plural: config?.plural ?? '',
  })
  const resourceDisplayName = resourceData?.items?.[0]?.spec?.displayName || resourceName

  const factoryData = useMemo(
    () =>
      config
        ? buildNamespacedResourceDetailsFactory({
            basePath,
            clusterId,
            config,
            displayName: resourceDisplayName,
            name: resourceName,
            namespace: resourceNamespace,
          })
        : null,
    [basePath, clusterId, config, resourceDisplayName, resourceName, resourceNamespace],
  )
  const breadcrumbItems = useMemo(
    () =>
      config
        ? buildSgroupsResourceDetailsBreadcrumbs({
            basePath,
            namespace: resourceNamespace,
            plural: config.plural,
            resourceName: resourceDisplayName,
            resourceTitle: config.title,
          })
        : [],
    [basePath, config, resourceDisplayName, resourceNamespace],
  )

  if (!clusterId) {
    return <Alert type="error" message="Cluster is required to open resource details." />
  }

  if (!config || !resourceNamespace || !resourceName) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Resource route params are incomplete." />
  }

  if (!factoryData) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Resource factory is unavailable." />
  }

  return (
    <SgroupsPageShell breadcrumbItems={breadcrumbItems}>
      <Typography.Title level={4} style={{ display: 'none' }}>
        {resourceDisplayName} details
      </Typography.Title>
      <SgroupsFactoryRenderer<TSgroupsResourceDetailsComponentMap>
        components={components}
        factoryData={factoryData}
        theme={mode}
      />
    </SgroupsPageShell>
  )
}
