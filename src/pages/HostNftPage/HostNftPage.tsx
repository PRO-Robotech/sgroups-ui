import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useParams } from 'react-router-dom'
import { SgroupsPageShell } from 'components/molecules'
import { useContentCardHeight } from 'hooks/useContentCardHeight'
import { getPluginBasePath } from 'utils/getPluginBasePath'
import { getApiEndpoint } from 'utils'

type THostNftPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export type TSgroupsHostNftTabData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsHostNftTabProps = {
  data: TSgroupsHostNftTabData
}

type TNft = {
  json?: unknown
  text?: string
}

type TNftList = {
  items?: TNft[]
  metadata?: {
    resourceVersion?: string
  }
}

type TNftWatchEvent = {
  object?: TNftList
  type?: string
}

type TNftRow = TNft & {
  key: string
  index: number
}

type TNftSummaryRow = {
  chain?: string
  details: string
  family?: string
  handle?: string
  hook?: string
  key: string
  policy?: string
  rawJson?: unknown
  rawText?: string
  table?: string
  type: string
}

const TABLE_MIN_SCROLL_Y = 240
const NFT_TABLE_SUBTRACT_HEIGHT = 300
const RAW_PRE_STYLE: React.CSSProperties = {
  display: 'block',
  maxHeight: 320,
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
}

const TYPE_COLORS: Record<string, string> = {
  chain: 'blue',
  flowtable: 'purple',
  rule: 'green',
  set: 'gold',
  table: 'cyan',
  text: 'default',
}

const formatJson = (value: unknown) => {
  if (value === undefined || value === null) {
    return '-'
  }

  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }

  return JSON.stringify(value, null, 2)
}

const renderPreformatted = (value?: string) => (
  <Typography.Text code style={RAW_PRE_STYLE}>
    {value || '-'}
  </Typography.Text>
)

const buildRows = (items?: TNft[]): TNftRow[] =>
  (items || []).map((item, index) => ({
    ...item,
    index: index + 1,
    key: `${index}-${item.text || ''}-${formatJson(item.json).slice(0, 80)}`,
  }))

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const normalizeJsonValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  return value
}

const getNftEntries = (value: unknown) => {
  const normalizedValue = normalizeJsonValue(value)

  if (Array.isArray(normalizedValue)) {
    return normalizedValue
  }

  const normalizedObject = asRecord(normalizedValue)
  const nftables = normalizedObject?.nftables

  return Array.isArray(nftables) ? nftables : []
}

const getStringValue = (record: Record<string, unknown> | null, key: string) => {
  const value = record?.[key]

  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return String(value)
}

const summarizeExpression = (expr: unknown) => {
  if (!Array.isArray(expr) || expr.length === 0) {
    return ''
  }

  return expr
    .map(item => {
      const record = asRecord(item)
      const key = record ? Object.keys(record)[0] : undefined

      return key || JSON.stringify(item)
    })
    .filter(Boolean)
    .join(' -> ')
}

const summarizeEntry = (type: string, payload: Record<string, unknown> | null) => {
  if (!payload) {
    return ''
  }

  if (type === 'chain') {
    return [
      getStringValue(payload, 'type') ? `type ${getStringValue(payload, 'type')}` : undefined,
      getStringValue(payload, 'prio') ? `priority ${getStringValue(payload, 'prio')}` : undefined,
    ]
      .filter(Boolean)
      .join(', ')
  }

  if (type === 'rule') {
    return summarizeExpression(payload.expr)
  }

  if (type === 'set') {
    return getStringValue(payload, 'type') ? `type ${getStringValue(payload, 'type')}` : ''
  }

  return ''
}

const buildSummaryRows = (rows: TNftRow[]): TNftSummaryRow[] =>
  rows.flatMap(row => {
    const entries = getNftEntries(row.json)

    if (entries.length === 0) {
      return [
        {
          details: row.text?.split(/\r?\n/).find(Boolean) || 'Text-only ruleset',
          key: `${row.key}-text`,
          rawJson: row.json,
          rawText: row.text,
          type: 'text',
        },
      ]
    }

    return entries.map((entry, entryIndex) => {
      const entryRecord = asRecord(entry)
      const type = entryRecord ? Object.keys(entryRecord)[0] || 'entry' : 'entry'
      const payload = asRecord(entryRecord?.[type])

      return {
        chain: type === 'chain' ? getStringValue(payload, 'name') : getStringValue(payload, 'chain'),
        details: summarizeEntry(type, payload),
        family: getStringValue(payload, 'family'),
        handle: getStringValue(payload, 'handle'),
        hook: getStringValue(payload, 'hook'),
        key: `${row.key}-${entryIndex}-${type}`,
        policy: getStringValue(payload, 'policy'),
        rawJson: entry,
        rawText: row.text,
        table: type === 'table' ? getStringValue(payload, 'name') : getStringValue(payload, 'table'),
        type,
      }
    })
  })

const isNftList = (payload: unknown): payload is TNftList =>
  Boolean(payload && typeof payload === 'object' && 'items' in payload)

const normalizeNftPayload = (payload: unknown): TNftList | null => {
  if (isNftList(payload)) {
    return payload
  }

  const event = payload as TNftWatchEvent

  if (isNftList(event?.object)) {
    return event.object
  }

  return null
}

const parseWatchLine = (line: string) => {
  const trimmedLine = line.trim()

  if (!trimmedLine) {
    return null
  }

  const jsonLine = trimmedLine.startsWith('data:') ? trimmedLine.slice('data:'.length).trim() : trimmedLine

  if (!jsonLine || jsonLine === '[DONE]') {
    return null
  }

  try {
    return JSON.parse(jsonLine)
  } catch {
    return null
  }
}

const buildNftEndpoint = (cluster: string, namespace: string, name: string, watch: boolean) => {
  const params = new URLSearchParams()

  if (watch) {
    params.set('watch', 'true')
  }

  const query = params.toString()

  return `${getApiEndpoint(cluster, namespace, 'hosts')}/${name}/nft${query ? `?${query}` : ''}`
}

const readErrorText = async (response: Response) => {
  try {
    return await response.text()
  } catch {
    return response.statusText
  }
}

const summaryColumns: ColumnsType<TNftSummaryRow> = [
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: 110,
    render: value => <Tag color={TYPE_COLORS[value] || 'default'}>{String(value).toUpperCase()}</Tag>,
  },
  {
    title: 'Family',
    dataIndex: 'family',
    key: 'family',
    width: 100,
    render: value => value || '-',
  },
  {
    title: 'Table',
    dataIndex: 'table',
    key: 'table',
    width: 180,
    render: value => value || '-',
  },
  {
    title: 'Chain',
    dataIndex: 'chain',
    key: 'chain',
    width: 180,
    render: value => value || '-',
  },
  {
    title: 'Hook',
    dataIndex: 'hook',
    key: 'hook',
    width: 140,
    render: value => value || '-',
  },
  {
    title: 'Policy',
    dataIndex: 'policy',
    key: 'policy',
    width: 120,
    render: value => value || '-',
  },
  {
    title: 'Handle',
    dataIndex: 'handle',
    key: 'handle',
    width: 110,
    render: value => value || '-',
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
    ellipsis: true,
    render: value => value || '-',
  },
]

const renderExpandedSummaryRow = (record: TNftSummaryRow) => (
  <Flex vertical gap={12}>
    <div>
      <Typography.Text strong>Object JSON</Typography.Text>
      {renderPreformatted(formatJson(record.rawJson))}
    </div>
  </Flex>
)

export const SgroupsHostNftTab: FC<TSgroupsHostNftTabProps> = ({ data }) => {
  const { token } = antdTheme.useToken()
  const contentCardHeight = useContentCardHeight()
  const { clusterId: cluster, namespace, name } = data
  const [isLoading, setIsLoading] = useState(false)
  const [isComputingRows, setIsComputingRows] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [summaryRows, setSummaryRows] = useState<TNftSummaryRow[]>([])
  const [hasResolvedRows, setHasResolvedRows] = useState(false)
  const [watch, setWatch] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>()
  const [lastResourceVersion, setLastResourceVersion] = useState<string>()
  const [lastEndpoint, setLastEndpoint] = useState<string>()
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoSubmitRef = useRef(false)
  const computeTimeoutRef = useRef<number>()
  const cardMinHeight = Math.max(360, contentCardHeight - 170)
  const tableScrollY = Math.max(TABLE_MIN_SCROLL_Y, contentCardHeight - NFT_TABLE_SUBTRACT_HEIGHT)
  const isTableLoading = !hasResolvedRows && (isLoading || isComputingRows)

  const stopWatch = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsWatching(false)
  }, [])

  useEffect(() => stopWatch, [stopWatch])

  useEffect(() => {
    return () => {
      if (computeTimeoutRef.current) {
        window.clearTimeout(computeTimeoutRef.current)
      }
    }
  }, [])

  const applyNftList = useCallback((payload: TNftList) => {
    if (computeTimeoutRef.current) {
      window.clearTimeout(computeTimeoutRef.current)
    }

    setIsComputingRows(true)
    setLastResourceVersion(payload.metadata?.resourceVersion)
    setLastUpdated(new Date().toLocaleTimeString())

    computeTimeoutRef.current = window.setTimeout(() => {
      setSummaryRows(buildSummaryRows(buildRows(payload.items)))
      setHasResolvedRows(true)
      setIsComputingRows(false)
      computeTimeoutRef.current = undefined
    }, 0)
  }, [])

  const applyNftPayload = useCallback(
    (payload: unknown) => {
      const nftList = normalizeNftPayload(payload)

      if (nftList) {
        applyNftList(nftList)
      }
    },
    [applyNftList],
  )

  const runSnapshotRequest = useCallback(
    async (endpoint: string, signal: AbortSignal) => {
      const response = await fetch(endpoint, { signal })

      if (!response.ok) {
        throw new Error(await readErrorText(response))
      }

      applyNftPayload(await response.json())
    },
    [applyNftPayload],
  )

  const runWatchRequest = useCallback(
    async (endpoint: string, signal: AbortSignal) => {
      const response = await fetch(endpoint, { signal })

      if (!response.ok) {
        throw new Error(await readErrorText(response))
      }

      if (!response.body) {
        throw new Error('Watch response body is empty.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!signal.aborted) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || ''

        lines
          .map(parseWatchLine)
          .filter(Boolean)
          .forEach(line => {
            applyNftPayload(line)
          })

        const bufferedPayload = parseWatchLine(buffer)

        if (bufferedPayload) {
          applyNftPayload(bufferedPayload)
          buffer = ''
        }
      }

      const trailingLine = buffer.trim()

      if (trailingLine && !signal.aborted) {
        applyNftPayload(parseWatchLine(trailingLine))
      }
    },
    [applyNftPayload],
  )

  const runRequest = useCallback(
    async (shouldWatch: boolean) => {
      if (!cluster || !namespace || !name) {
        return
      }

      stopWatch()

      const endpoint = buildNftEndpoint(cluster, namespace, name, shouldWatch)
      const controller = new AbortController()

      abortControllerRef.current = controller
      if (computeTimeoutRef.current) {
        window.clearTimeout(computeTimeoutRef.current)
        computeTimeoutRef.current = undefined
      }

      setSummaryRows([])
      setHasResolvedRows(false)
      setIsComputingRows(false)
      setLastResourceVersion(undefined)
      setLastUpdated(undefined)
      setLastEndpoint(endpoint)
      setIsLoading(true)
      setIsWatching(shouldWatch)

      try {
        if (shouldWatch) {
          await runSnapshotRequest(buildNftEndpoint(cluster, namespace, name, false), controller.signal)

          if (controller.signal.aborted) {
            return
          }

          await runWatchRequest(endpoint, controller.signal)
        } else {
          await runSnapshotRequest(endpoint, controller.signal)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setHasResolvedRows(true)
          message.error(`Failed to load nftables ruleset: ${String(error)}`)
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }

        setIsLoading(false)
        setIsWatching(false)
      }
    },
    [cluster, name, namespace, runSnapshotRequest, runWatchRequest, stopWatch],
  )

  const handleSubmit = useCallback(() => runRequest(watch), [runRequest, watch])

  useEffect(() => {
    if (autoSubmitRef.current || !cluster || !namespace || !name) {
      return
    }

    autoSubmitRef.current = true
    runRequest(true).catch(() => undefined)
  }, [cluster, name, namespace, runRequest])

  if (!cluster) {
    return <Alert type="error" message="Cluster is required to open host nftables." showIcon />
  }

  if (!namespace || !name) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Host route params are incomplete." />
  }

  return (
    <Card style={{ minHeight: cardMinHeight, background: token.colorBgContainer }}>
      <Flex vertical gap={16}>
        <Flex gap={16} align="center" wrap="wrap">
          <Switch checked={watch} checkedChildren="Watch" unCheckedChildren="Snapshot" onChange={setWatch} />
          <Button icon={<ReloadOutlined />} loading={isLoading && !isWatching} type="primary" onClick={handleSubmit}>
            Submit
          </Button>
          {isWatching && (
            <Button danger onClick={stopWatch}>
              Stop watch
            </Button>
          )}
          {lastUpdated && (
            <Typography.Text type="secondary">
              Updated {lastUpdated}
              {lastResourceVersion ? `, rv ${lastResourceVersion}` : ''}
            </Typography.Text>
          )}
        </Flex>

        {lastEndpoint && (
          <Typography.Text code copyable style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
            {lastEndpoint}
          </Typography.Text>
        )}

        {isTableLoading ? (
          <Flex align="center" justify="center" style={{ minHeight: tableScrollY }}>
            <Spin />
          </Flex>
        ) : (
          <Table<TNftSummaryRow>
            columns={summaryColumns}
            dataSource={summaryRows}
            expandable={{
              expandedRowRender: renderExpandedSummaryRow,
              rowExpandable: record => Boolean(record.rawJson),
            }}
            pagination={false}
            size="middle"
            scroll={{ x: 1300, y: tableScrollY }}
          />
        )}
      </Flex>
    </Card>
  )
}

export const HostNftPage: FC<THostNftPageProps> = ({ cluster }) => {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const basePath = useMemo(() => getPluginBasePath(typeof window === 'undefined' ? '' : window.location.pathname), [])
  const breadcrumbItems = useMemo(
    () => [
      { key: 'hosts', label: 'Host', link: `${basePath}/hosts` },
      { key: 'host-name', label: name || 'Host', link: `${basePath}/hosts/${namespace}/${name}` },
      { key: 'nft', label: 'NFT' },
    ],
    [basePath, name, namespace],
  )

  return (
    <SgroupsPageShell breadcrumbItems={breadcrumbItems}>
      <SgroupsHostNftTab data={{ clusterId: cluster || '', namespace: namespace || '', name: name || '' }} />
    </SgroupsPageShell>
  )
}
