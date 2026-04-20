import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Flex, Spin, theme as antdTheme } from 'antd'
import { useSelector } from 'react-redux'
import { ContentCard, EnrichedTable, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TenantSelector } from 'components'
import { RootState } from 'store/store'
import { Styled } from './styled'
import {
  buildNetworksColumns,
  mapNetworksToRows,
  NETWORKS_TABLE_PROPS,
  TNetworkResource,
  TNetworkRow,
} from './tableConfig'
import { VerboseNetworkPanel } from './molecules'
import { DEFAULT_VERBOSE_WIDTH, EXPANDED_VERBOSE_WIDTH, VERBOSE_WIDTH_STORAGE_KEY } from './constants'

const getExpandedVerboseWidth = (containerWidth?: number) => {
  if (!containerWidth) {
    return EXPANDED_VERBOSE_WIDTH
  }

  return (containerWidth - Styled.DETAIL_PANEL_SPLITTER_WIDTH) / 2
}

type TNetworksProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

const clampVerboseWidth = (width: number, containerWidth?: number) => {
  const maxWidth = containerWidth
    ? Math.max(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth - 360)
    : EXPANDED_VERBOSE_WIDTH

  return Math.min(Math.max(width, Styled.DETAIL_PANEL_MIN_WIDTH), maxWidth)
}

export const Networks: FC<TNetworksProps> = ({ cluster, namespace }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)
  const { token } = antdTheme.useToken()

  const splitLayoutRef = useRef<HTMLDivElement>(null)

  const [selectedNetworkKey, setSelectedNetworkKey] = useState<string | null>(null)
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
    data: networksData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items: TNetworkResource[] }>({
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'networks',
    isEnabled: Boolean(cluster),
  })

  const columns = useMemo(() => buildNetworksColumns(), [])
  const dataSource = useMemo(() => mapNetworksToRows(networksData?.items || []), [networksData?.items])
  const selectedNetwork = useMemo(
    () => dataSource.find(item => item.key === selectedNetworkKey) || null,
    [dataSource, selectedNetworkKey],
  )
  const networksLayoutStyle = useMemo(
    () =>
      ({
        ['--table-splitter-border-color' as string]: token.colorBorder,
        ['--table-splitter-border-secondary-color' as string]: token.colorBorderSecondary,
        ['--table-splitter-bg-color' as string]: token.colorBgContainer,
        ['--table-splitter-layout-bg' as string]: token.colorBgLayout,
        ['--table-splitter-row-selected-bg' as string]: token.colorPrimaryBg,
        ['--table-splitter-row-selected-hover-bg' as string]: token.colorPrimaryBgHover,
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
    if (selectedNetworkKey && !dataSource.some(item => item.key === selectedNetworkKey)) {
      setSelectedNetworkKey(null)
    }
  }, [dataSource, selectedNetworkKey])

  useEffect(() => {
    if (!isResizing) {
      return undefined
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

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
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  const closeVerbose = useCallback(() => {
    setSelectedNetworkKey(null)
  }, [])

  const collapseVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth))
  }, [])

  const expandVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(getExpandedVerboseWidth(containerWidth), containerWidth))
  }, [])

  const handleRowClick = useCallback((record: TNetworkRow) => {
    setSelectedNetworkKey(currentValue => (currentValue === record.key ? null : record.key))
  }, [])

  if (!cluster) {
    return <Alert type="error" message="No cluster has been set" showIcon />
  }

  return (
    <ContentCard displayFlex flexFlow="column" flexGrow={1}>
      <Flex vertical gap={16} style={{ flex: 1, minHeight: 0 }}>
        <TenantSelector cluster={cluster} tenant={namespace} />
        {error && <Alert type="error" message={`Failed to load networks: ${String(error)}`} showIcon />}
        {isLoading && !networksData && <Spin />}
        {!error && networksData && (
          <>
            <Styled.SplitLayout
              ref={splitLayoutRef}
              $detailWidth={verboseWidth}
              $isDetailOpen={Boolean(selectedNetwork)}
              style={networksLayoutStyle}
            >
              <Styled.TablePane>
                <EnrichedTable<TNetworkRow>
                  theme={theme}
                  dataSource={dataSource}
                  columns={columns}
                  rowClickable
                  rowClassName={record => (record.key === selectedNetworkKey ? 'network-row-selected' : '')}
                  onRow={record => ({
                    onClick: () => handleRowClick(record),
                  })}
                  tableProps={{
                    borderless: true,
                    paginationPosition: ['bottomRight'],
                    isTotalLeft: true,
                    disablePagination: Boolean(NETWORKS_TABLE_PROPS.pagination === false),
                  }}
                  withoutControls
                />
              </Styled.TablePane>
              {selectedNetwork && (
                <>
                  <Styled.ResizeHandle
                    aria-label="Resize network details panel"
                    role="separator"
                    onMouseDown={event => {
                      event.preventDefault()
                      setIsResizing(true)
                    }}
                  />
                  <Styled.DetailPane>
                    <VerboseNetworkPanel
                      cluster={cluster}
                      namespace={namespace}
                      network={selectedNetwork}
                      width={verboseWidth}
                      onClose={closeVerbose}
                      onCollapse={collapseVerbose}
                      onExpand={expandVerbose}
                    />
                  </Styled.DetailPane>
                </>
              )}
            </Styled.SplitLayout>
            {selectedNetwork && (
              <Styled.MobileDetailPane style={networksLayoutStyle}>
                <VerboseNetworkPanel
                  cluster={cluster}
                  namespace={namespace}
                  network={selectedNetwork}
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
