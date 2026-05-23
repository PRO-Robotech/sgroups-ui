import React, { FC, useMemo } from 'react'
import { Spin } from 'antd'
import {
  DynamicRendererWithProviders,
  ErrorBoundary,
  TFactoryDataK8s,
  TItemTypeMap,
  TRendererComponents,
  useK8sSmartResource,
} from '@prorobotech/openapi-k8s-toolkit'

type TK8sFactoryRequest = Exclude<TFactoryDataK8s<TItemTypeMap>['urlsToFetch'][number], string>

type TSgroupsFactoryRendererProps<T extends TItemTypeMap> = {
  components: TRendererComponents<T>
  factoryData: TFactoryDataK8s<T>
  theme: 'light' | 'dark'
}

const loadingContainerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 160px)',
  overflow: 'hidden',
}

const isK8sFactoryRequest = (
  request: TFactoryDataK8s<TItemTypeMap>['urlsToFetch'][number],
): request is TK8sFactoryRequest => typeof request !== 'string'

export const SgroupsFactoryRenderer = <T extends TItemTypeMap>({
  components,
  factoryData,
  theme,
}: TSgroupsFactoryRendererProps<T>) => {
  const prefetchRequest = useMemo(() => factoryData.urlsToFetch.find(isK8sFactoryRequest), [factoryData.urlsToFetch])
  const prefetchQuery = useK8sSmartResource<unknown>({
    ...(prefetchRequest ?? {
      cluster: '',
      apiVersion: '',
      plural: '',
    }),
    isEnabled: Boolean(prefetchRequest),
  })

  if (prefetchRequest && prefetchQuery.isLoading) {
    return (
      <div style={loadingContainerStyle}>
        <Spin />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <DynamicRendererWithProviders<T>
        components={components}
        items={factoryData.data}
        urlsToFetch={factoryData.urlsToFetch}
        effectiveReqIndexes={factoryData.effectiveReqIndexes}
        effectiveItemsPath={factoryData.effectiveItemsPath}
        theme={theme}
        key={factoryData.key}
      />
    </ErrorBoundary>
  )
}

export type TSgroupsFactoryRendererComponent = FC<TSgroupsFactoryRendererProps<TItemTypeMap>>
