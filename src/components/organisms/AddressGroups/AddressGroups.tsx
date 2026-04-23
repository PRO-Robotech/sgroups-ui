import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Flex, Spin, theme as antdTheme } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { ContentCard, EnrichedTable, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TenantSelector } from 'components'
import { RootState } from 'store/store'
import { AddressGroupFormModal, VerboseAddressGroupPanel } from './molecules'
import {
  ADDRESS_GROUPS_TABLE_PROPS,
  buildAddressGroupsColumns,
  mapAddressGroupsToRows,
  TAddressGroupResource,
  TAddressGroupRow,
} from './tableConfig'
import { DEFAULT_VERBOSE_WIDTH, EXPANDED_VERBOSE_WIDTH, VERBOSE_WIDTH_STORAGE_KEY } from './constants'
import { Styled } from './styled'

const getExpandedVerboseWidth = (containerWidth?: number) => {
  if (!containerWidth) {
    return EXPANDED_VERBOSE_WIDTH
  }

  return (containerWidth - Styled.DETAIL_PANEL_SPLITTER_WIDTH) / 2
}

type TAddressGroupsProps = {
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

export const AddressGroups: FC<TAddressGroupsProps> = ({ cluster, namespace }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)
  const { token } = antdTheme.useToken()

  const splitLayoutRef = useRef<HTMLDivElement>(null)

  const [selectedAddressGroupKey, setSelectedAddressGroupKey] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddressGroup, setEditingAddressGroup] = useState<TAddressGroupRow | null>(null)
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
    data: addressGroupsData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items: TAddressGroupResource[] }>({
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'addressgroups',
    isEnabled: Boolean(cluster),
  })

  const openCreateModal = useCallback(() => {
    setEditingAddressGroup(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((addressGroup: TAddressGroupRow) => {
    setEditingAddressGroup(addressGroup)
    setIsModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingAddressGroup(null)
  }, [])

  const columns = useMemo(() => buildAddressGroupsColumns({ onEdit: openEditModal }), [openEditModal])
  const dataSource = useMemo(() => mapAddressGroupsToRows(addressGroupsData?.items || []), [addressGroupsData?.items])
  const selectedAddressGroup = useMemo(
    () => dataSource.find(item => item.key === selectedAddressGroupKey) || null,
    [dataSource, selectedAddressGroupKey],
  )
  const addressGroupsLayoutStyle = useMemo(
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
    if (selectedAddressGroupKey && !dataSource.some(item => item.key === selectedAddressGroupKey)) {
      setSelectedAddressGroupKey(null)
    }
  }, [dataSource, selectedAddressGroupKey])

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
    setSelectedAddressGroupKey(null)
  }, [])

  const collapseVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth))
  }, [])

  const expandVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(getExpandedVerboseWidth(containerWidth), containerWidth))
  }, [])

  const handleRowClick = useCallback((record: TAddressGroupRow) => {
    setSelectedAddressGroupKey(currentValue => (currentValue === record.key ? null : record.key))
  }, [])

  if (!cluster) {
    return <Alert type="error" message="No cluster has been set" showIcon />
  }

  return (
    <ContentCard displayFlex flexFlow="column" flexGrow={1}>
      <Flex vertical gap={16} style={{ flex: 1, minHeight: 0 }}>
        <TenantSelector cluster={cluster} tenant={namespace} />
        {error && <Alert type="error" message={`Failed to load address groups: ${String(error)}`} showIcon />}
        {isLoading && !addressGroupsData && <Spin />}
        {!error && addressGroupsData && (
          <Flex vertical style={{ flex: 1, minHeight: 0 }}>
            <Styled.SplitLayout
              ref={splitLayoutRef}
              $detailWidth={verboseWidth}
              $isDetailOpen={Boolean(selectedAddressGroup)}
              style={addressGroupsLayoutStyle}
            >
              <Styled.TablePane>
                <EnrichedTable<TAddressGroupRow>
                  theme={theme}
                  dataSource={dataSource}
                  columns={columns}
                  rowClickable
                  rowClassName={record => (record.key === selectedAddressGroupKey ? 'address-group-row-selected' : '')}
                  onRow={record => ({
                    onClick: () => handleRowClick(record),
                  })}
                  tableProps={{
                    borderless: true,
                    paginationPosition: ['bottomRight'],
                    isTotalLeft: true,
                    disablePagination: Boolean(ADDRESS_GROUPS_TABLE_PROPS.pagination === false),
                  }}
                  withoutControls
                />
              </Styled.TablePane>
              {selectedAddressGroup && (
                <>
                  <Styled.ResizeHandle
                    aria-label="Resize address group details panel"
                    role="separator"
                    onMouseDown={event => {
                      event.preventDefault()
                      setIsResizing(true)
                    }}
                  />
                  <Styled.DetailPane>
                    <VerboseAddressGroupPanel
                      cluster={cluster}
                      namespace={namespace}
                      addressGroup={selectedAddressGroup}
                      width={verboseWidth}
                      onClose={closeVerbose}
                      onCollapse={collapseVerbose}
                      onExpand={expandVerbose}
                    />
                  </Styled.DetailPane>
                </>
              )}
            </Styled.SplitLayout>
            {selectedAddressGroup && (
              <Styled.MobileDetailPane style={addressGroupsLayoutStyle}>
                <VerboseAddressGroupPanel
                  cluster={cluster}
                  namespace={namespace}
                  addressGroup={selectedAddressGroup}
                  onClose={closeVerbose}
                  onCollapse={collapseVerbose}
                  onExpand={expandVerbose}
                />
              </Styled.MobileDetailPane>
            )}
            <Styled.BottomActionBar style={addressGroupsLayoutStyle}>
              <Button type="primary" onClick={openCreateModal}>
                <PlusOutlined />
                Add Address Group
              </Button>
            </Styled.BottomActionBar>
          </Flex>
        )}
      </Flex>
      {isModalOpen && (
        <AddressGroupFormModal
          cluster={cluster}
          namespace={namespace}
          addressGroup={editingAddressGroup}
          open={isModalOpen}
          onClose={closeFormModal}
        />
      )}
    </ContentCard>
  )
}
