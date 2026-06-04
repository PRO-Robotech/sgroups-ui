import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Empty, Flex, Switch, Table, Typography, message, theme as antdTheme } from 'antd'
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

const TABLE_MIN_SCROLL_Y = 240
const NFT_TABLE_SUBTRACT_HEIGHT = 300

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
  <Typography.Text code style={{ display: 'block', maxHeight: 260, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
    {value || '-'}
  </Typography.Text>
)

const buildRows = (items?: TNft[]): TNftRow[] =>
  (items || []).map((item, index) => ({
    ...item,
    index: index + 1,
    key: `${index}-${item.text || ''}-${formatJson(item.json).slice(0, 80)}`,
  }))

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

const columns: ColumnsType<TNftRow> = [
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    width: 70,
  },
  {
    title: 'Text',
    dataIndex: 'text',
    key: 'text',
    render: renderPreformatted,
  },
  {
    title: 'JSON',
    dataIndex: 'json',
    key: 'json',
    render: value => renderPreformatted(formatJson(value)),
  },
]

export const SgroupsHostNftTab: FC<TSgroupsHostNftTabProps> = ({ data }) => {
  const { token } = antdTheme.useToken()
  const contentCardHeight = useContentCardHeight()
  const { clusterId: cluster, namespace, name } = data
  const [rows, setRows] = useState<TNftRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [watch, setWatch] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>()
  const [lastResourceVersion, setLastResourceVersion] = useState<string>()
  const [lastEndpoint, setLastEndpoint] = useState<string>()
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoSubmitRef = useRef(false)
  const cardMinHeight = Math.max(360, contentCardHeight - 170)
  const tableScrollY = Math.max(TABLE_MIN_SCROLL_Y, contentCardHeight - NFT_TABLE_SUBTRACT_HEIGHT)

  const stopWatch = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsWatching(false)
  }, [])

  useEffect(() => stopWatch, [stopWatch])

  const applyNftList = useCallback((payload: TNftList) => {
    setRows(buildRows(payload.items))
    setLastResourceVersion(payload.metadata?.resourceVersion)
    setLastUpdated(new Date().toLocaleTimeString())
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
      setRows([])
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

        <Table<TNftRow>
          columns={columns}
          dataSource={rows}
          loading={isLoading && !isWatching}
          pagination={false}
          size="middle"
          scroll={{ x: 1200, y: tableScrollY }}
        />
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
