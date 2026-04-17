import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Flex, Spin, theme as antdTheme } from 'antd'
import { useSelector } from 'react-redux'
import { ContentCard, EnrichedTable, useK8sSmartResource } from '@prorobotech/openapi-k8s-toolkit'
import { TenantSelector } from 'components'
import { RootState } from 'store/store'
import { VerboseRulePanel } from './VerboseRulePanel'
import { Styled } from './styled'
import { buildRulesColumns, mapRulesToRows, RULES_TABLE_PROPS, TRuleResource, TRuleRow } from './tableConfig'

type TRulesPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

const DEFAULT_VERBOSE_WIDTH = 420
const EXPANDED_VERBOSE_WIDTH = 640
const VERBOSE_WIDTH_STORAGE_KEY = 'sgroups-rules-verbose-width'

const clampVerboseWidth = (width: number, containerWidth?: number) => {
  const maxWidth = containerWidth
    ? Math.max(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth - 360)
    : EXPANDED_VERBOSE_WIDTH

  return Math.min(Math.max(width, Styled.DETAIL_PANEL_MIN_WIDTH), maxWidth)
}

export const RulesPage: FC<TRulesPageProps> = ({ cluster, namespace }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)
  const { token } = antdTheme.useToken()
  const splitLayoutRef = useRef<HTMLDivElement>(null)
  const [selectedRuleKey, setSelectedRuleKey] = useState<string | null>(null)
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
    data: rulesData,
    isLoading,
    error,
  } = useK8sSmartResource<{ items: TRuleResource[] }>({
    cluster: cluster || '',
    namespace,
    apiGroup: 'sgroups.io',
    apiVersion: 'v1alpha1',
    plural: 'rules',
    isEnabled: Boolean(cluster),
  })

  const columns = useMemo(() => buildRulesColumns(), [])
  const dataSource = useMemo(() => mapRulesToRows(rulesData?.items || []), [rulesData?.items])
  const selectedRule = useMemo(
    () => dataSource.find(item => item.key === selectedRuleKey) || null,
    [dataSource, selectedRuleKey],
  )
  const rulesLayoutStyle = useMemo(
    () =>
      ({
        ['--rules-border-color' as string]: token.colorBorder,
        ['--rules-border-secondary-color' as string]: token.colorBorderSecondary,
        ['--rules-bg-color' as string]: token.colorBgContainer,
        ['--rules-layout-bg' as string]: token.colorBgLayout,
        ['--rules-row-selected-bg' as string]: token.colorPrimaryBg,
        ['--rules-row-selected-hover-bg' as string]: token.colorPrimaryBgHover,
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
    if (selectedRuleKey && !dataSource.some(item => item.key === selectedRuleKey)) {
      setSelectedRuleKey(null)
    }
  }, [dataSource, selectedRuleKey])

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
    setSelectedRuleKey(null)
  }, [])

  const collapseVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(Styled.DETAIL_PANEL_MIN_WIDTH, containerWidth))
  }, [])

  const expandVerbose = useCallback(() => {
    const containerWidth = splitLayoutRef.current?.getBoundingClientRect().width
    setVerboseWidth(clampVerboseWidth(EXPANDED_VERBOSE_WIDTH, containerWidth))
  }, [])

  const handleRowClick = useCallback((record: TRuleRow) => {
    setSelectedRuleKey(currentValue => (currentValue === record.key ? null : record.key))
  }, [])

  if (!cluster) {
    return <Alert type="error" message="No cluster has been set" showIcon />
  }

  return (
    <ContentCard displayFlex flexFlow="column" flexGrow={1}>
      <Flex vertical gap={16} style={{ flex: 1, minHeight: 0 }}>
        <TenantSelector cluster={cluster} tenant={namespace} />
        {error && <Alert type="error" message={`Failed to load rules: ${String(error)}`} showIcon />}
        {isLoading && !rulesData && <Spin />}
        {!error && rulesData && (
          <>
            <Styled.SplitLayout
              ref={splitLayoutRef}
              $detailWidth={verboseWidth}
              $isDetailOpen={Boolean(selectedRule)}
              style={rulesLayoutStyle}
            >
              <Styled.TablePane>
                <EnrichedTable<TRuleRow>
                  theme={theme}
                  dataSource={dataSource}
                  columns={columns}
                  rowClickable
                  rowClassName={record => (record.key === selectedRuleKey ? 'rule-row-selected' : '')}
                  onRow={record => ({
                    onClick: () => handleRowClick(record),
                  })}
                  tableProps={{
                    borderless: true,
                    paginationPosition: ['bottomRight'],
                    isTotalLeft: true,
                    disablePagination: Boolean(RULES_TABLE_PROPS.pagination === false),
                  }}
                  withoutControls
                />
              </Styled.TablePane>
              {selectedRule && (
                <>
                  <Styled.ResizeHandle
                    aria-label="Resize rule details panel"
                    role="separator"
                    onMouseDown={event => {
                      event.preventDefault()
                      setIsResizing(true)
                    }}
                  />
                  <Styled.DetailPane>
                    <VerboseRulePanel
                      cluster={cluster}
                      namespace={namespace}
                      rule={selectedRule}
                      width={verboseWidth}
                      onClose={closeVerbose}
                      onCollapse={collapseVerbose}
                      onExpand={expandVerbose}
                    />
                  </Styled.DetailPane>
                </>
              )}
            </Styled.SplitLayout>
            {selectedRule && (
              <Styled.MobileDetailPane style={rulesLayoutStyle}>
                <VerboseRulePanel
                  cluster={cluster}
                  namespace={namespace}
                  rule={selectedRule}
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
