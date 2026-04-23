import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Spin, theme as antdTheme } from 'antd'
import { useSelector } from 'react-redux'
import { ContentCard, DeleteModal, EnrichedTable, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TenantSelector } from 'components'
import { RootState } from 'store/store'
import { getDeleteModalResource, TDeleteModalResource } from 'utils'
import { HostFormModal, VerboseHostPanel } from './molecules'
import { Styled } from './styled'
import { buildHostsColumns, HOSTS_TABLE_PROPS, mapHostsToRows, THostResource, THostRow } from './tableConfig'
import { DEFAULT_VERBOSE_WIDTH, EXPANDED_VERBOSE_WIDTH, VERBOSE_WIDTH_STORAGE_KEY } from './constants'

const getExpandedVerboseWidth = (containerWidth?: number) => {
  if (!containerWidth) {
    return EXPANDED_VERBOSE_WIDTH
  }

  return (containerWidth - Styled.DETAIL_PANEL_SPLITTER_WIDTH) / 2
}

type THostsProps = {
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

export const Hosts: FC<THostsProps> = ({ cluster, namespace }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)
  const { token } = antdTheme.useToken()

  const splitLayoutRef = useRef<HTMLDivElement>(null)

  const [selectedHostKey, setSelectedHostKey] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingHost, setEditingHost] = useState<THostRow | null>(null)
  const [deletingHost, setDeletingHost] = useState<TDeleteModalResource | null>(null)
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
    data: hostsData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items: THostResource[] }>({
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'hosts',
    isEnabled: Boolean(cluster),
  })

  const openCreateModal = useCallback(() => {
    setEditingHost(null)
    setIsFormModalOpen(true)
  }, [])

  const openEditModal = useCallback((hostRecord: THostRow) => {
    setEditingHost(hostRecord)
    setIsFormModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setEditingHost(null)
  }, [])

  const openDeleteModal = useCallback(
    (hostRecord: THostRow) => {
      setDeletingHost(getDeleteModalResource(cluster || '', namespace, 'hosts', hostRecord))
    },
    [cluster, namespace],
  )

  const closeDeleteModal = useCallback(() => {
    setDeletingHost(null)
  }, [])

  const columns = useMemo(
    () => buildHostsColumns({ onDelete: openDeleteModal, onEdit: openEditModal }),
    [openDeleteModal, openEditModal],
  )
  const dataSource = useMemo(() => mapHostsToRows(hostsData?.items || []), [hostsData?.items])
  const selectedHost = useMemo(
    () => dataSource.find(item => item.key === selectedHostKey) || null,
    [dataSource, selectedHostKey],
  )
  const hostsLayoutStyle = useMemo(
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
    if (selectedHostKey && !dataSource.some(item => item.key === selectedHostKey)) {
      setSelectedHostKey(null)
    }
  }, [dataSource, selectedHostKey])

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
    setSelectedHostKey(null)
  }, [])

  const collapseVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth))
  }, [])

  const expandVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(getExpandedVerboseWidth(containerWidth), containerWidth))
  }, [])

  const handleRowClick = useCallback((record: THostRow) => {
    setSelectedHostKey(currentValue => (currentValue === record.key ? null : record.key))
  }, [])

  if (!cluster) {
    return <Alert type="error" message="No cluster has been set" showIcon />
  }

  return (
    <ContentCard displayFlex flexFlow="column" flexGrow={1}>
      <Flex vertical gap={16} style={{ flex: 1, minHeight: 0 }}>
        <TenantSelector cluster={cluster} tenant={namespace} />
        {error && <Alert type="error" message={`Failed to load hosts: ${String(error)}`} showIcon />}
        {isLoading && !hostsData && <Spin />}
        {!error && hostsData && (
          <Flex vertical style={{ flex: 1, minHeight: 0 }}>
            <Styled.SplitLayout
              ref={splitLayoutRef}
              $detailWidth={verboseWidth}
              $isDetailOpen={Boolean(selectedHost)}
              style={hostsLayoutStyle}
            >
              <Styled.TablePane>
                <EnrichedTable<THostRow>
                  theme={theme}
                  dataSource={dataSource}
                  columns={columns}
                  rowClickable
                  rowClassName={record => (record.key === selectedHostKey ? 'host-row-selected' : '')}
                  onRow={record => ({
                    onClick: () => handleRowClick(record),
                  })}
                  tableProps={{
                    borderless: true,
                    paginationPosition: ['bottomRight'],
                    isTotalLeft: true,
                    disablePagination: Boolean(HOSTS_TABLE_PROPS.pagination === false),
                  }}
                  withoutControls
                />
              </Styled.TablePane>
              {selectedHost && (
                <>
                  <Styled.ResizeHandle
                    aria-label="Resize host details panel"
                    role="separator"
                    onMouseDown={event => {
                      event.preventDefault()
                      setIsResizing(true)
                    }}
                  />
                  <Styled.DetailPane>
                    <VerboseHostPanel
                      host={selectedHost}
                      width={verboseWidth}
                      onClose={closeVerbose}
                      onCollapse={collapseVerbose}
                      onExpand={expandVerbose}
                    />
                  </Styled.DetailPane>
                </>
              )}
            </Styled.SplitLayout>
            {selectedHost && (
              <Styled.MobileDetailPane style={hostsLayoutStyle}>
                <VerboseHostPanel
                  host={selectedHost}
                  onClose={closeVerbose}
                  onCollapse={collapseVerbose}
                  onExpand={expandVerbose}
                />
              </Styled.MobileDetailPane>
            )}
            <Styled.BottomActionBar style={hostsLayoutStyle}>
              <Button type="primary" onClick={openCreateModal}>
                <PlusOutlined />
                Add Host
              </Button>
            </Styled.BottomActionBar>
          </Flex>
        )}
      </Flex>
      {isFormModalOpen && (
        <HostFormModal
          cluster={cluster}
          namespace={namespace}
          host={editingHost}
          open={isFormModalOpen}
          onClose={closeFormModal}
        />
      )}
      {deletingHost && (
        <DeleteModal name={deletingHost.name} endpoint={deletingHost.endpoint} onClose={closeDeleteModal} />
      )}
    </ContentCard>
  )
}
