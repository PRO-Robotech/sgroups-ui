import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from 'antd'
import { MinusOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useParams } from 'react-router-dom'
import { SgroupsPageShell } from 'components/molecules'
import { useContentCardHeight } from 'hooks/useContentCardHeight'
import { getPluginBasePath } from 'utils/getPluginBasePath'
import { getApiEndpoint } from 'utils'

type THostSockStatsPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export type TSgroupsHostSockStatsTabData = {
  clusterId: string
  namespace: string
  name: string
}

type TSgroupsHostSockStatsTabProps = {
  data: TSgroupsHostSockStatsTabData
}

type TSelectorKey =
  | 'protocol'
  | 'family'
  | 'state'
  | 'localAddr'
  | 'localPort'
  | 'remoteAddr'
  | 'remotePort'
  | 'ifname'
  | 'inode'
  | 'pid'
  | 'comm'

type TSelectorCondition = {
  key?: TSelectorKey
  value?: string
}

type TFormValues = {
  watch?: boolean
  selectors?: TSelectorCondition[]
}

type TSocketProcess = {
  pid?: number
  comm?: string
}

type TSocketStat = {
  family?: string
  ifname?: string
  inode?: number
  localAddr?: string
  localPort?: number
  processes?: TSocketProcess[]
  protocol?: string
  remoteAddr?: string
  remotePort?: number
  state?: string
}

type TSocketStatList = {
  items?: TSocketStat[]
  metadata?: {
    resourceVersion?: string
  }
}

type TSocketStatWatchEvent = {
  object?: TSocketStatList
  type?: string
}

type TSocketStatRow = TSocketStat & {
  key: string
}

const SELECTOR_KEYS: Array<{ label: string; value: TSelectorKey }> = [
  { label: 'protocol', value: 'protocol' },
  { label: 'family', value: 'family' },
  { label: 'state', value: 'state' },
  { label: 'localAddr', value: 'localAddr' },
  { label: 'localPort', value: 'localPort' },
  { label: 'remoteAddr', value: 'remoteAddr' },
  { label: 'remotePort', value: 'remotePort' },
  { label: 'ifname', value: 'ifname' },
  { label: 'inode', value: 'inode' },
  { label: 'pid', value: 'pid' },
  { label: 'comm', value: 'comm' },
]

const EMPTY_VALUE = '-'
const TABLE_MIN_SCROLL_Y = 240
const SOCKET_STATS_TABLE_SUBTRACT_HEIGHT = 350
const INITIAL_FORM_VALUES: TFormValues = {
  watch: true,
  selectors: [{ key: 'state', value: 'Listen' }],
}

const renderValue = (value?: string | number) => (value === undefined || value === '' ? EMPTY_VALUE : String(value))

const renderProcesses = (processes?: TSocketProcess[]) => {
  if (!processes?.length) {
    return EMPTY_VALUE
  }

  const keyCounts = new Map<string, number>()

  return (
    <Flex gap={4} wrap>
      {processes.map(process => {
        const baseKey = `${process.pid || 'pid'}-${process.comm || 'comm'}`
        const count = (keyCounts.get(baseKey) || 0) + 1
        keyCounts.set(baseKey, count)

        return (
          <Tag key={`${baseKey}-${count}`}>
            {process.comm || 'unknown'}
            {process.pid !== undefined ? ` (${process.pid})` : ''}
          </Tag>
        )
      })}
    </Flex>
  )
}

const buildRows = (items?: TSocketStat[]): TSocketStatRow[] =>
  (items || []).map((item, index) => ({
    ...item,
    key: [
      item.protocol,
      item.family,
      item.state,
      item.localAddr,
      item.localPort,
      item.remoteAddr,
      item.remotePort,
      item.inode,
      index,
    ]
      .filter(value => value !== undefined && value !== '')
      .join(':'),
  }))

const isSocketStatList = (payload: unknown): payload is TSocketStatList =>
  Boolean(payload && typeof payload === 'object' && 'items' in payload)

const normalizeSocketStatPayload = (payload: unknown): TSocketStatList | null => {
  if (isSocketStatList(payload)) {
    return payload
  }

  const event = payload as TSocketStatWatchEvent

  if (isSocketStatList(event?.object)) {
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

const normalizeSelector = (selectors?: TSelectorCondition[]) =>
  (selectors || [])
    .map(condition => ({
      key: condition.key,
      value: condition.value?.trim(),
    }))
    .filter((condition): condition is { key: TSelectorKey; value: string } => Boolean(condition.key && condition.value))
    .map(condition => `${condition.key}=${condition.value}`)
    .join(',')

const buildSockStatsEndpoint = (cluster: string, namespace: string, name: string, values: TFormValues) => {
  const params = new URLSearchParams()
  const selector = normalizeSelector(values.selectors)

  if (selector) {
    params.append('selector', selector)
  }

  if (values.watch) {
    params.set('watch', 'true')
  }

  const query = params.toString()

  return `${getApiEndpoint(cluster, namespace, 'hosts')}/${name}/sockstats${query ? `?${query}` : ''}`
}

const readErrorText = async (response: Response) => {
  try {
    return await response.text()
  } catch {
    return response.statusText
  }
}

const columns: ColumnsType<TSocketStatRow> = [
  {
    title: 'Protocol',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 110,
    render: renderValue,
    sorter: (a, b) => (a.protocol || '').localeCompare(b.protocol || ''),
  },
  {
    title: 'Family',
    dataIndex: 'family',
    key: 'family',
    width: 100,
    render: renderValue,
    sorter: (a, b) => (a.family || '').localeCompare(b.family || ''),
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
    width: 120,
    render: renderValue,
    sorter: (a, b) => (a.state || '').localeCompare(b.state || ''),
  },
  {
    title: 'Local Address',
    dataIndex: 'localAddr',
    key: 'localAddr',
    width: 180,
    render: renderValue,
  },
  {
    title: 'Local Port',
    dataIndex: 'localPort',
    key: 'localPort',
    width: 120,
    render: renderValue,
    sorter: (a, b) => (a.localPort || 0) - (b.localPort || 0),
  },
  {
    title: 'Remote Address',
    dataIndex: 'remoteAddr',
    key: 'remoteAddr',
    width: 180,
    render: renderValue,
  },
  {
    title: 'Remote Port',
    dataIndex: 'remotePort',
    key: 'remotePort',
    width: 130,
    render: renderValue,
    sorter: (a, b) => (a.remotePort || 0) - (b.remotePort || 0),
  },
  {
    title: 'Interface',
    dataIndex: 'ifname',
    key: 'ifname',
    width: 120,
    render: renderValue,
  },
  {
    title: 'Inode',
    dataIndex: 'inode',
    key: 'inode',
    width: 130,
    render: renderValue,
    sorter: (a, b) => (a.inode || 0) - (b.inode || 0),
  },
  {
    title: 'Processes',
    dataIndex: 'processes',
    key: 'processes',
    width: 240,
    render: renderProcesses,
  },
]

export const SgroupsHostSockStatsTab: FC<TSgroupsHostSockStatsTabProps> = ({ data }) => {
  const { token } = antdTheme.useToken()
  const contentCardHeight = useContentCardHeight()
  const { clusterId: cluster, namespace, name } = data
  const [form] = Form.useForm<TFormValues>()
  const [rows, setRows] = useState<TSocketStatRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>()
  const [lastResourceVersion, setLastResourceVersion] = useState<string>()
  const [lastEndpoint, setLastEndpoint] = useState<string>()
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoSubmitRef = useRef(false)
  const cardMinHeight = Math.max(360, contentCardHeight - 170)
  const tableScrollY = Math.max(TABLE_MIN_SCROLL_Y, contentCardHeight - SOCKET_STATS_TABLE_SUBTRACT_HEIGHT)

  const stopWatch = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsWatching(false)
  }, [])

  useEffect(() => stopWatch, [stopWatch])

  const applySocketStatList = useCallback((payload: TSocketStatList) => {
    setRows(buildRows(payload.items))
    setLastResourceVersion(payload.metadata?.resourceVersion)
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  const applySocketStatPayload = useCallback(
    (payload: unknown) => {
      const socketStatList = normalizeSocketStatPayload(payload)

      if (socketStatList) {
        applySocketStatList(socketStatList)
      }
    },
    [applySocketStatList],
  )

  const runSnapshotRequest = useCallback(
    async (endpoint: string, signal: AbortSignal) => {
      const response = await fetch(endpoint, { signal })

      if (!response.ok) {
        throw new Error(await readErrorText(response))
      }

      applySocketStatPayload(await response.json())
    },
    [applySocketStatPayload],
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
            applySocketStatPayload(line)
          })

        const bufferedPayload = parseWatchLine(buffer)

        if (bufferedPayload) {
          applySocketStatPayload(bufferedPayload)
          buffer = ''
        }
      }

      const trailingLine = buffer.trim()

      if (trailingLine && !signal.aborted) {
        applySocketStatPayload(parseWatchLine(trailingLine))
      }
    },
    [applySocketStatPayload],
  )

  const runRequest = useCallback(
    async (values: TFormValues) => {
      if (!cluster || !namespace || !name) {
        return
      }

      stopWatch()

      const endpoint = buildSockStatsEndpoint(cluster, namespace, name, values)
      const controller = new AbortController()

      abortControllerRef.current = controller
      setRows([])
      setLastResourceVersion(undefined)
      setLastUpdated(undefined)
      setLastEndpoint(endpoint)
      setIsLoading(true)
      setIsWatching(Boolean(values.watch))

      try {
        if (values.watch) {
          await runSnapshotRequest(
            buildSockStatsEndpoint(cluster, namespace, name, { ...values, watch: false }),
            controller.signal,
          )

          if (controller.signal.aborted) {
            return
          }

          await runWatchRequest(endpoint, controller.signal)
        } else {
          await runSnapshotRequest(endpoint, controller.signal)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          message.error(`Failed to load socket stats: ${String(error)}`)
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

  const handleSubmit = useCallback(async () => {
    if (!cluster || !namespace || !name) {
      return
    }

    const values = await form.validateFields()
    await runRequest(values)
  }, [cluster, form, name, namespace, runRequest])

  useEffect(() => {
    if (autoSubmitRef.current || !cluster || !namespace || !name) {
      return
    }

    autoSubmitRef.current = true
    runRequest(INITIAL_FORM_VALUES).catch(() => undefined)
  }, [cluster, name, namespace, runRequest])

  if (!cluster) {
    return <Alert type="error" message="Cluster is required to open host socket stats." showIcon />
  }

  if (!namespace || !name) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Host route params are incomplete." />
  }

  return (
    <Card style={{ minHeight: cardMinHeight, background: token.colorBgContainer }}>
      <Flex vertical gap={16}>
        <Form<TFormValues> form={form} initialValues={INITIAL_FORM_VALUES} layout="vertical" onFinish={handleSubmit}>
          <Flex vertical gap={12}>
            <Form.List name="selectors">
              {(selectors, { add: addSelector, remove: removeSelector }) => (
                <Flex vertical gap={8}>
                  {selectors.map(selector => (
                    <Flex key={selector.key} gap={8} align="flex-start" wrap="wrap">
                      <Form.Item
                        name={[selector.name, 'key']}
                        rules={[{ required: true, message: 'Key is required' }]}
                        style={{ flex: '0 1 180px', marginBottom: 0 }}
                      >
                        <Select options={SELECTOR_KEYS} placeholder="Key" showSearch />
                      </Form.Item>
                      <Form.Item
                        name={[selector.name, 'value']}
                        rules={[{ required: true, message: 'Value is required' }]}
                        style={{ flex: '1 1 240px', marginBottom: 0 }}
                      >
                        <Input placeholder="Value" />
                      </Form.Item>
                      <Button
                        aria-label="Remove condition"
                        disabled={selectors.length === 1}
                        icon={<MinusOutlined />}
                        type="text"
                        onClick={() => removeSelector(selector.name)}
                      />
                    </Flex>
                  ))}
                  <Button icon={<PlusOutlined />} type="dashed" onClick={() => addSelector({})}>
                    Add condition
                  </Button>
                </Flex>
              )}
            </Form.List>

            <Flex gap={16} align="center" wrap="wrap">
              <Form.Item name="watch" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Watch" unCheckedChildren="Snapshot" />
              </Form.Item>
              <Button htmlType="submit" icon={<ReloadOutlined />} loading={isLoading && !isWatching} type="primary">
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
          </Flex>
        </Form>

        {lastEndpoint && (
          <Typography.Text code copyable style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
            {lastEndpoint}
          </Typography.Text>
        )}

        <Table<TSocketStatRow>
          columns={columns}
          dataSource={rows}
          loading={isLoading && !isWatching}
          pagination={false}
          size="middle"
          scroll={{ x: 1510, y: tableScrollY }}
        />
      </Flex>
    </Card>
  )
}

export const HostSockStatsPage: FC<THostSockStatsPageProps> = ({ cluster }) => {
  const { namespace, name } = useParams<{ namespace: string; name: string }>()
  const basePath = useMemo(() => getPluginBasePath(typeof window === 'undefined' ? '' : window.location.pathname), [])
  const breadcrumbItems = useMemo(
    () => [
      { key: 'hosts', label: 'Host', link: `${basePath}/hosts` },
      { key: 'host-name', label: name || 'Host', link: `${basePath}/hosts/${namespace}/${name}` },
      { key: 'sockstats', label: 'Socket Stats' },
    ],
    [basePath, name, namespace],
  )

  return (
    <SgroupsPageShell breadcrumbItems={breadcrumbItems}>
      <SgroupsHostSockStatsTab data={{ clusterId: cluster || '', namespace: namespace || '', name: name || '' }} />
    </SgroupsPageShell>
  )
}
