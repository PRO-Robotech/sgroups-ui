import React, { FC, useMemo } from 'react'
import { Alert, Flex, Spin } from 'antd'
import { AnyObject } from 'antd/es/_util/type'
import { useSelector } from 'react-redux'
import { EnrichedTable, TSingleResource, ContentCard, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TenantSelector } from 'components'
import { RootState } from 'store/store'
import {
  buildHostsColumns,
  buildHostsDataSource,
  HOSTS_KEY_TYPE_PROPS,
  HOSTS_SORTERS_AND_FILTERS,
  HOSTS_TRIM_LENGTHS,
  HOSTS_UNDEFINED_VALUES,
} from './tableConfig'

type THostsPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const HostsPage: FC<THostsPageProps> = ({ cluster, namespace }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)

  const {
    data: hostsData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items: TSingleResource[] }>({
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'hosts',
    isEnabled: Boolean(cluster),
  })

  const columns = useMemo(() => buildHostsColumns(), [])
  const dataSource = useMemo(() => buildHostsDataSource(hostsData?.items || []), [hostsData?.items])

  if (!cluster) {
    return <Alert type="error" message="No cluster has been set" showIcon />
  }

  return (
    <ContentCard displayFlex flexFlow="column" flexGrow={1}>
      <Flex vertical gap={16}>
        <TenantSelector cluster={cluster} tenant={namespace} />
        {error && <Alert type="error" message={`Failed to load hosts: ${String(error)}`} showIcon />}
        {isLoading && !hostsData && <Spin />}
        {!error && hostsData && (
          <EnrichedTable
            theme={theme}
            dataSource={dataSource as AnyObject[] | undefined}
            columns={columns}
            additionalPrinterColumnsUndefinedValues={HOSTS_UNDEFINED_VALUES}
            additionalPrinterColumnsTrimLengths={HOSTS_TRIM_LENGTHS}
            additionalPrinterColumnsKeyTypeProps={HOSTS_KEY_TYPE_PROPS}
            additionalPrinterColumnsCustomSortersAndFilters={HOSTS_SORTERS_AND_FILTERS}
            tableProps={{
              disablePagination: false,
            }}
            withoutControls
          />
        )}
      </Flex>
    </ContentCard>
  )
}
