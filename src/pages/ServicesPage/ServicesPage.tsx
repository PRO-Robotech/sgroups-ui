import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Flex, Spin, Table, theme as antdTheme } from 'antd'
import { ContentCard, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TenantSelector } from 'components'
import { Styled } from './styled'
import { buildServicesColumns, mapServicesToRows, SERVICES_TABLE_PROPS, TServiceResource, TServiceRow } from './tableConfig'
import { VerboseServicePanel } from './VerboseServicePanel'

type TServicesPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

const DEFAULT_VERBOSE_WIDTH = 420
const EXPANDED_VERBOSE_WIDTH = 640
const VERBOSE_WIDTH_STORAGE_KEY = 'sgroups-services-verbose-width'

const clampVerboseWidth = (width: number, containerWidth?: number) => {
  const maxWidth = containerWidth
    ? Math.max(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth - 360)
    : EXPANDED_VERBOSE_WIDTH

  return Math.min(Math.max(width, Styled.DETAIL_PANEL_MIN_WIDTH), maxWidth)
}

export const ServicesPage: FC<TServicesPageProps> = ({ cluster, namespace }) => {
  const { token } = antdTheme.useToken()
  const splitLayoutRef = useRef<HTMLDivElement>(null)
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [verboseWidth, setVerboseWidth] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_VERBOSE_WIDTH
    }

    const storedWidth = window.localStorage.getItem(VERBOSE_WIDTH_STORAGE_KEY)
    const parsedWidth = storedWidth ? Number(storedWidth) : Number.NaN

    return Number.isFinite(parsedWidth) ? parsedWidth : DEFAULT_VERBOSE_WIDTH
  })

  const {
    data: servicesData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items: TServiceResource[] }>({
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'services',
    isEnabled: Boolean(cluster),
  })

  const columns = useMemo(() => buildServicesColumns(), [])
  const dataSource = useMemo(() => mapServicesToRows(servicesData?.items || []), [servicesData?.items])
  const selectedService = useMemo(
    () => dataSource.find(item => item.key === selectedServiceKey) || null,
    [dataSource, selectedServiceKey],
  )
  const servicesLayoutStyle = useMemo(
    () =>
      ({
        ['--services-border-color' as string]: token.colorBorder,
        ['--services-border-secondary-color' as string]: token.colorBorderSecondary,
        ['--services-bg-color' as string]: token.colorBgContainer,
        ['--services-layout-bg' as string]: token.colorBgLayout,
        ['--services-row-selected-bg' as string]: token.colorPrimaryBg,
        ['--services-row-selected-hover-bg' as string]: token.colorPrimaryBgHover,
      }) as React.CSSProperties,
    [token],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(VERBOSE_WIDTH_STORAGE_KEY, String(verboseWidth))
  }, [verboseWidth])

  useEffect(() => {
    if (selectedServiceKey && !dataSource.some(item => item.key === selectedServiceKey)) {
      setSelectedServiceKey(null)
    }
  }, [dataSource, selectedServiceKey])

  useEffect(() => {
    if (!isResizing) {
      return undefined
    }

    const handleMouseMove = (event: MouseEvent) => {
      const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width

      if (!containerWidth) {
        return
      }

      const nextWidth = clampVerboseWidth(
        containerWidth - event.clientX + (splitLayoutRef.current?.getBoundingClientRect().left || 0),
        containerWidth,
      )
      setVerboseWidth(nextWidth)
    }

    const stopResizing = () => setIsResizing(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopResizing)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  const closeVerbose = useCallback(() => {
    setSelectedServiceKey(null)
  }, [])

  const collapseVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth))
  }, [])

  const expandVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(EXPANDED_VERBOSE_WIDTH, containerWidth))
  }, [])

  const handleRowClick = useCallback((record: TServiceRow) => {
    setSelectedServiceKey(currentValue => (currentValue === record.key ? null : record.key))
  }, [])

  if (!cluster) {
    return <Alert type="error" message="No cluster has been set" showIcon />
  }

  return (
    <ContentCard displayFlex flexFlow="column" flexGrow={1}>
      <Flex vertical gap={16}>
        <TenantSelector cluster={cluster} tenant={namespace} />
        {error && <Alert type="error" message={`Failed to load services: ${String(error)}`} showIcon />}
        {isLoading && !servicesData && <Spin />}
        {!error && servicesData && (
          <>
            <Styled.SplitLayout
              ref={splitLayoutRef}
              $detailWidth={verboseWidth}
              $isDetailOpen={Boolean(selectedService)}
              style={servicesLayoutStyle}
            >
              <Styled.TablePane>
                <Table<TServiceRow>
                  {...SERVICES_TABLE_PROPS}
                  dataSource={dataSource}
                  columns={columns}
                  rowClassName={record => (record.key === selectedServiceKey ? 'service-row-selected' : '')}
                  onRow={record => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' },
                  })}
                />
              </Styled.TablePane>
              {selectedService && (
                <>
                  <Styled.ResizeHandle
                    aria-label="Resize service details panel"
                    role="separator"
                    onMouseDown={() => setIsResizing(true)}
                  />
                  <Styled.DetailPane>
                    <VerboseServicePanel
                      service={selectedService}
                      width={verboseWidth}
                      onClose={closeVerbose}
                      onCollapse={collapseVerbose}
                      onExpand={expandVerbose}
                    />
                  </Styled.DetailPane>
                </>
              )}
            </Styled.SplitLayout>
            {selectedService && (
              <Styled.MobileDetailPane style={servicesLayoutStyle}>
                <VerboseServicePanel
                  service={selectedService}
                  onClose={closeVerbose}
                  onCollapse={collapseVerbose}
                  onExpand={expandVerbose}
                />
              </Styled.MobileDetailPane>
            )}
          </>
        )}
      </Flex>
    </ContentCard>
  )
}
