import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Spin,
  Switch,
  Tabs,
  Tag,
  Typography,
  message,
  theme as antdTheme,
} from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
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

type TNftView = 'plain' | 'structure'

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
  expressionLines?: string[]
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

type THierarchyTable = {
  chains: TNftSummaryRow[]
  key: string
  loose: TNftSummaryRow[]
  row: TNftSummaryRow
  rulesByChain: Record<string, TNftSummaryRow[]>
}

type TStructureVirtualItem =
  | { key: string; table: THierarchyTable; type: 'table' }
  | { key: string; row: TNftSummaryRow; table: THierarchyTable; type: 'chain' }
  | { chain?: TNftSummaryRow; key: string; row: TNftSummaryRow; table: THierarchyTable; type: 'rule' }
  | { key: string; row: TNftSummaryRow; type: 'loose' }

const TABLE_MIN_SCROLL_Y = 240
const NFT_TABLE_SUBTRACT_HEIGHT = 300
const STRUCTURE_VIRTUAL_OVERSCAN = 8
const STRUCTURE_CHAIN_COMPACT_HEIGHT = 58
const STRUCTURE_CHAIN_VERBOSE_HEIGHT = 92
const STRUCTURE_LOOSE_HEIGHT = 92
const STRUCTURE_RULE_HEIGHT = 47
const STRUCTURE_TABLE_HEIGHT = 96
const NFT_MONACO_LANGUAGE = 'nftables'
let isNftMonacoLanguageRegistered = false
const scheduleAfterPaint = (callback: () => void) => {
  if (typeof window.requestAnimationFrame !== 'function') {
    const timeoutId = window.setTimeout(callback, 16)

    return () => window.clearTimeout(timeoutId)
  }

  let isCancelled = false
  let secondFrameId: number | undefined
  const firstFrameId = window.requestAnimationFrame(() => {
    secondFrameId = window.requestAnimationFrame(() => {
      if (!isCancelled) {
        callback()
      }
    })
  })

  return () => {
    isCancelled = true
    window.cancelAnimationFrame(firstFrameId)

    if (secondFrameId) {
      window.cancelAnimationFrame(secondFrameId)
    }
  }
}

const scheduleNextFrame = (callback: () => void) => {
  if (typeof window.requestAnimationFrame !== 'function') {
    return window.setTimeout(callback, 0)
  }

  return window.requestAnimationFrame(callback)
}

const configureNftMonaco = (monaco: Monaco) => {
  if (isNftMonacoLanguageRegistered) {
    return
  }

  isNftMonacoLanguageRegistered = true
  monaco.languages.register({ id: NFT_MONACO_LANGUAGE })
  monaco.languages.setMonarchTokensProvider(NFT_MONACO_LANGUAGE, {
    ignoreCase: false,
    tokenizer: {
      root: [
        [/#.*$/, 'comment'],
        [/\b(table|chain|rule|set|map|flowtable|define|include)\b/, 'keyword'],
        [
          /\b(type|hook|priority|policy|handle|flags|elements|devices|size|timeout|counter|comment)\b/,
          'type.identifier',
        ],
        [
          /\b(accept|drop|reject|return|jump|goto|continue|queue|masquerade|dnat|snat|redirect|log|limit)\b/,
          'keyword.control',
        ],
        [/\b(ip|ip6|inet|arp|bridge|netdev|tcp|udp|icmp|icmpv6|meta|ct|rt|ether|th|fib)\b/, 'namespace'],
        [/\b(saddr|daddr|sport|dport|l4proto|iif|iifname|oif|oifname|state|mark|protocol)\b/, 'attribute.name'],
        [/\b(established|related|new|invalid)\b/, 'constant.language'],
        [/\b\d{1,3}(?:\.\d{1,3}){3}(?:\/\d{1,2})?\b/, 'number'],
        [/\b[0-9a-fA-F:]{2,}(?:\/\d{1,3})?\b/, 'number.hex'],
        [/\b\d+\b/, 'number'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        [/[{}[\]();,]/, 'delimiter'],
        [/[!=<>]=?|&&|\|\|/, 'operator'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    },
  })
}

const STRUCTURE_PANEL_STYLE: React.CSSProperties = {
  borderRadius: 6,
  padding: '8px 10px',
}

const STRUCTURE_FIELD_STYLE: React.CSSProperties = {
  minWidth: 96,
}

const TYPE_COLORS: Record<string, string> = {
  chain: 'blue',
  flowtable: 'purple',
  rule: 'green',
  set: 'gold',
  table: 'cyan',
  text: 'default',
}

const RULE_ACTIONS = new Set(['accept', 'drop', 'reject', 'return', 'masquerade'])

const getRuleExpressionTagColor = (line: string) => {
  const lowerLine = line.toLowerCase()

  if (RULE_ACTIONS.has(lowerLine) || lowerLine.startsWith('jump ') || lowerLine.startsWith('go ')) {
    return 'success'
  }

  if (lowerLine.startsWith('count traffic')) {
    return 'processing'
  }

  if (lowerLine.startsWith('match extension')) {
    return 'purple'
  }

  if (line.includes('==') || line.includes('!=') || line.includes('matches')) {
    return 'geekblue'
  }

  return 'default'
}

const RULE_TAG_STYLE: React.CSSProperties = {
  borderRadius: 12,
  lineHeight: '20px',
  marginInlineEnd: 0,
  maxWidth: '100%',
  paddingInline: 8,
  whiteSpace: 'normal',
  wordBreak: 'break-word',
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

const buildPlainResponse = (payload: TNftList) => {
  const textParts = (payload.items || []).map(item => item.text).filter(Boolean)

  if (textParts.length > 0) {
    return textParts.join('\n\n')
  }

  return formatJson(payload)
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

const renderStructureField = (label: string, value?: string) =>
  value ? (
    <Flex vertical style={STRUCTURE_FIELD_STYLE}>
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Typography.Text>{value}</Typography.Text>
    </Flex>
  ) : null

const formatDisplayValue = (value: unknown): string => {
  if (value === undefined || value === null || value === '') {
    return ''
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value
      .map(item => {
        const record = asRecord(item)
        const key = record ? Object.keys(record)[0] : undefined

        return key || formatDisplayValue(item)
      })
      .filter(Boolean)
      .join(' -> ')
  }

  return formatJson(value)
}

const STRUCTURE_PRIMARY_FIELDS = new Set([
  'family',
  'name',
  'table',
  'chain',
  'hook',
  'policy',
  'handle',
  'type',
  'prio',
])
const RULE_FIELD_EXCLUSIONS = new Set([...STRUCTURE_PRIMARY_FIELDS, 'expr', 'exprs'])

const renderAdditionalStructureFields = (row: TNftSummaryRow) => {
  const record = asRecord(row.rawJson)
  const payload = asRecord(record?.[row.type])

  if (!payload) {
    return null
  }

  const fields = Object.entries(payload)
    .filter(([key]) => !(row.type === 'rule' ? RULE_FIELD_EXCLUSIONS : STRUCTURE_PRIMARY_FIELDS).has(key))
    .map(([key, value]) => [key, formatDisplayValue(value)] as const)
    .filter(([, value]) => value)

  if (fields.length === 0) {
    return null
  }

  return (
    <Flex gap={16} wrap="wrap">
      {fields.map(([key, value]) => (
        <Flex key={key} vertical style={{ minWidth: 140, maxWidth: 520 }}>
          <Typography.Text type="secondary">{key}</Typography.Text>
          <Typography.Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</Typography.Text>
        </Flex>
      ))}
    </Flex>
  )
}

const getExpressionSelector = (value: unknown): string => {
  const record = asRecord(value)

  if (!record) {
    return formatDisplayValue(value)
  }

  const payload = asRecord(record.payload)
  if (payload) {
    return [getStringValue(payload, 'protocol'), getStringValue(payload, 'field')].filter(Boolean).join('.')
  }

  const meta = asRecord(record.meta)
  if (meta) {
    return ['meta', getStringValue(meta, 'key')].filter(Boolean).join('.')
  }

  const ct = asRecord(record.ct)
  if (ct) {
    return ['ct', getStringValue(ct, 'key')].filter(Boolean).join('.')
  }

  const rt = asRecord(record.rt)
  if (rt) {
    return ['rt', getStringValue(rt, 'key')].filter(Boolean).join('.')
  }

  const key = Object.keys(record)[0]
  return key ? `${key}.${formatDisplayValue(record[key])}` : formatDisplayValue(value)
}

const getExpressionValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(getExpressionValue).filter(Boolean).join(', ')
  }

  return formatDisplayValue(value)
}

const describeNamedExpression = (key: string, value: unknown) => {
  const record = asRecord(value)

  if (key === 'xt') {
    const name = getStringValue(record, 'name') || getStringValue(record, 'type') || getExpressionValue(value)

    return name ? `Match extension: ${name}` : 'Match extension'
  }

  if (key === 'counter') {
    const packets = getStringValue(record, 'packets')
    const bytes = getStringValue(record, 'bytes')
    const metrics = [packets ? `${packets} packets` : undefined, bytes ? `${bytes} bytes` : undefined]
      .filter(Boolean)
      .join(', ')

    return metrics ? `Count traffic: ${metrics}` : 'Count traffic'
  }

  if (key === 'jump' || key === 'goto') {
    const target = getStringValue(record, 'target') || getStringValue(record, 'chain') || getExpressionValue(value)

    return target && target !== '-' ? `${key === 'jump' ? 'Jump' : 'Go'} to ${target}` : key
  }

  if (key === 'match') {
    const selector = getExpressionSelector(record?.left)
    const op = getStringValue(record, 'op') || 'matches'
    const valueText = getExpressionValue(record?.right ?? record?.data)

    return [selector, op, valueText].filter(Boolean).join(' ')
  }

  const valueText = getExpressionValue(value)

  if (!valueText || valueText === '-') {
    return key
  }

  return `${key}: ${valueText}`
}

const describeRuleExpressions = (row: TNftSummaryRow): string[] => {
  const record = asRecord(row.rawJson)
  const payload = asRecord(record?.rule)
  const expressions = payload?.expr ?? payload?.exprs

  if (!Array.isArray(expressions)) {
    return row.details ? [row.details] : []
  }

  const lines: string[] = []
  let pendingSelector = ''

  expressions.forEach(expression => {
    const expressionRecord = asRecord(expression)
    if (!expressionRecord) {
      return
    }

    const payloadExpression = asRecord(expressionRecord.payload)
    const metaExpression = asRecord(expressionRecord.meta)
    const ctExpression = asRecord(expressionRecord.ct)
    const rtExpression = asRecord(expressionRecord.rt)

    if (payloadExpression || metaExpression || ctExpression || rtExpression) {
      pendingSelector = getExpressionSelector(expressionRecord)
      return
    }

    const cmp = asRecord(expressionRecord.cmp)
    if (cmp) {
      const op = getStringValue(cmp, 'op') || 'matches'
      const selector = pendingSelector || getExpressionSelector(cmp.left)
      const value = getExpressionValue(cmp.data ?? cmp.right)

      lines.push([selector, op, value].filter(Boolean).join(' '))
      pendingSelector = ''
      return
    }

    if (expressionRecord.match) {
      lines.push(describeNamedExpression('match', expressionRecord.match))
      pendingSelector = ''
      return
    }

    const verdict = asRecord(expressionRecord.verdict)
    if (verdict) {
      const verdictType = Object.keys(verdict)[0]
      const verdictValue = verdictType ? getExpressionValue(verdict[verdictType]) : ''
      lines.push(['verdict', verdictType, verdictValue].filter(Boolean).join(' '))
      return
    }

    ;['accept', 'drop', 'reject', 'return', 'jump', 'goto', 'masquerade', 'counter', 'log', 'limit', 'xt'].some(key => {
      if (!(key in expressionRecord)) {
        return false
      }

      lines.push(describeNamedExpression(key, expressionRecord[key]))
      return true
    })
  })

  return lines.length > 0 ? lines : [summarizeExpression(expressions)].filter(Boolean)
}

const prepareStructureRows = (rows: TNftSummaryRow[]) =>
  rows.map(row => (row.type === 'rule' ? { ...row, expressionLines: describeRuleExpressions(row) } : row))

const buildHierarchy = (rows: TNftSummaryRow[]) => {
  const tables = new Map<string, THierarchyTable>()
  const loose: TNftSummaryRow[] = []

  const getTableKey = (family?: string, table?: string) => `${family || 'unknown'}:${table || 'unknown'}`
  const ensureTable = (row: TNftSummaryRow) => {
    if (!row.table) {
      return null
    }

    const key = getTableKey(row.family, row.table)
    const existing = tables.get(key)

    if (existing) {
      return existing
    }

    const tableRow: TNftSummaryRow = {
      details: '',
      family: row.family,
      key: `${key}-implicit-table`,
      table: row.table,
      type: 'table',
    }
    const table = { chains: [], key, loose: [], row: tableRow, rulesByChain: {} }
    tables.set(key, table)

    return table
  }

  rows.forEach(row => {
    if (row.type !== 'table') {
      return
    }

    const key = getTableKey(row.family, row.table)
    tables.set(key, { chains: [], key, loose: [], row, rulesByChain: {} })
  })

  rows.forEach(row => {
    if (row.type === 'table') {
      return
    }

    const tableKey = getTableKey(row.family, row.table)
    const table = tables.get(tableKey) || ensureTable(row)

    if (!table) {
      loose.push(row)
      return
    }

    if (row.type === 'chain') {
      table.chains.push(row)
      return
    }

    if (row.type === 'rule') {
      const chainKey = row.chain || 'unassigned'
      table.rulesByChain[chainKey] = [...(table.rulesByChain[chainKey] || []), row]
      return
    }

    table.loose.push(row)
  })

  return { loose, tables: Array.from(tables.values()) }
}

const renderRule = (rule: TNftSummaryRow, borderColor: string) => {
  const expressionLines = rule.expressionLines || describeRuleExpressions(rule)

  return (
    <div key={rule.key} style={{ border: `1px solid ${borderColor}`, borderRadius: 6, padding: '4px 8px' }}>
      <Flex align="center" gap={8} wrap="wrap">
        <Tag color={TYPE_COLORS.rule} style={{ borderRadius: 12, marginInlineEnd: 0 }}>
          RULE
        </Tag>
        {rule.chain && <Typography.Text type="secondary">{rule.chain}</Typography.Text>}
        <Flex align="center" gap={6} wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
          {expressionLines.map(line => (
            <Tag
              bordered={false}
              color={getRuleExpressionTagColor(line)}
              key={`${rule.key}-expr-${line}`}
              style={RULE_TAG_STYLE}
            >
              {line}
            </Tag>
          ))}
        </Flex>
      </Flex>
    </div>
  )
}

const renderLooseStructureItem = (row: TNftSummaryRow, borderColor: string, marginLeft = 0) => (
  <div key={row.key} style={{ ...STRUCTURE_PANEL_STYLE, border: `1px solid ${borderColor}`, marginLeft }}>
    <Flex vertical gap={8}>
      <Flex align="center" gap={8} wrap="wrap">
        <Tag color={TYPE_COLORS[row.type] || 'default'}>{row.type.toUpperCase()}</Tag>
        <Typography.Text strong>{row.chain || row.table || row.details || row.type}</Typography.Text>
      </Flex>

      <Flex gap={16} wrap="wrap">
        {renderStructureField('Family', row.family)}
        {renderStructureField('Table', row.table)}
        {renderStructureField('Chain', row.chain)}
        {renderStructureField('Hook', row.hook)}
        {renderStructureField('Policy', row.policy)}
      </Flex>

      {row.details && (
        <Typography.Text style={{ wordBreak: 'break-word' }} type="secondary">
          {row.details}
        </Typography.Text>
      )}

      {renderAdditionalStructureFields(row)}
    </Flex>
  </div>
)

const flattenStructure = (rows: TNftSummaryRow[]): TStructureVirtualItem[] => {
  const { loose, tables } = buildHierarchy(rows)
  const items: TStructureVirtualItem[] = []

  tables.forEach(table => {
    items.push({ key: table.key, table, type: 'table' })

    table.chains.forEach(chain => {
      items.push({ key: chain.key, row: chain, table, type: 'chain' })
      ;(table.rulesByChain[chain.chain || 'unassigned'] || []).forEach(rule => {
        items.push({ chain, key: rule.key, row: rule, table, type: 'rule' })
      })
    })

    table.loose.forEach(row => {
      items.push({ key: row.key, row, type: 'loose' })
    })
  })

  loose.forEach(row => {
    items.push({ key: row.key, row, type: 'loose' })
  })

  return items
}

const renderVirtualStructureItem = (item: TStructureVirtualItem, borderColor: string) => {
  if (item.type === 'table') {
    const { table } = item

    return (
      <div key={item.key} style={{ ...STRUCTURE_PANEL_STYLE, border: `1px solid ${borderColor}` }}>
        <Flex vertical gap={8}>
          <Flex align="center" gap={8} wrap="wrap">
            <Tag color={TYPE_COLORS.table}>TABLE</Tag>
            <Typography.Text strong>{table.row.table || table.row.details || 'Table'}</Typography.Text>
            {table.row.family && <Typography.Text type="secondary">{table.row.family}</Typography.Text>}
          </Flex>

          <Flex gap={16} wrap="wrap">
            {renderStructureField('Family', table.row.family)}
            {renderStructureField('Table', table.row.table)}
          </Flex>
        </Flex>
      </div>
    )
  }

  if (item.type === 'chain') {
    const chain = item.row

    return (
      <div
        key={item.key}
        style={{
          ...STRUCTURE_PANEL_STYLE,
          border: `1px solid ${borderColor}`,
          borderLeft: `2px solid ${borderColor}`,
          marginLeft: 12,
        }}
      >
        <Flex vertical gap={6}>
          <Flex align="center" gap={8} wrap="wrap">
            <Tag color={TYPE_COLORS.chain}>CHAIN</Tag>
            <Typography.Text strong>{chain.chain || 'Chain'}</Typography.Text>
          </Flex>

          <Flex gap={16} wrap="wrap">
            {renderStructureField('Hook', chain.hook)}
            {renderStructureField('Policy', chain.policy)}
            {renderStructureField('Details', chain.details)}
          </Flex>
        </Flex>
      </div>
    )
  }

  if (item.type === 'rule') {
    return (
      <div key={item.key} style={{ marginLeft: 24 }}>
        {renderRule(item.row, borderColor)}
      </div>
    )
  }

  return renderLooseStructureItem(item.row, borderColor, 12)
}

const getStructureItemHeight = (item: TStructureVirtualItem) => {
  if (item.type === 'rule') {
    return STRUCTURE_RULE_HEIGHT
  }

  if (item.type === 'table') {
    return STRUCTURE_TABLE_HEIGHT
  }

  if (item.type === 'chain') {
    return item.row.hook || item.row.policy || item.row.details
      ? STRUCTURE_CHAIN_VERBOSE_HEIGHT
      : STRUCTURE_CHAIN_COMPACT_HEIGHT
  }

  return STRUCTURE_LOOSE_HEIGHT
}

const buildStructureOffsets = (items: TStructureVirtualItem[]) => {
  const offsets = [0]

  items.forEach(item => {
    offsets.push(offsets[offsets.length - 1] + getStructureItemHeight(item))
  })

  return offsets
}

const findStructureItemIndex = (offsets: number[], scrollOffset: number) => {
  let low = 0
  let high = Math.max(0, offsets.length - 2)

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const currentOffset = offsets[middle]
    const nextOffset = offsets[middle + 1]

    if (currentOffset <= scrollOffset && scrollOffset < nextOffset) {
      return middle
    }

    if (currentOffset > scrollOffset) {
      high = middle - 1
    } else {
      low = middle + 1
    }
  }

  return Math.max(0, Math.min(offsets.length - 2, low))
}

type TStructureVirtualListProps = {
  borderColor: string
  items: TStructureVirtualItem[]
  maxHeight: number
}

const StructureVirtualList = React.memo(function StructureVirtualList({
  borderColor,
  items,
  maxHeight,
}: TStructureVirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const frameRef = useRef<number>()
  const rowOffsets = useMemo(() => buildStructureOffsets(items), [items])
  const totalHeight = rowOffsets[rowOffsets.length - 1] || 0
  const startIndex = Math.max(0, findStructureItemIndex(rowOffsets, scrollTop) - STRUCTURE_VIRTUAL_OVERSCAN)
  const endIndex = Math.min(
    items.length,
    findStructureItemIndex(rowOffsets, scrollTop + maxHeight) + STRUCTURE_VIRTUAL_OVERSCAN + 1,
  )
  const visibleItems = useMemo(
    () =>
      items.slice(startIndex, endIndex).map((item, index) => {
        const itemIndex = startIndex + index

        return {
          height: rowOffsets[itemIndex + 1] - rowOffsets[itemIndex],
          item,
          top: rowOffsets[itemIndex],
        }
      }),
    [endIndex, items, rowOffsets, startIndex],
  )

  useEffect(() => {
    if (scrollTop > totalHeight) {
      setScrollTop(0)
    }
  }, [scrollTop, totalHeight])

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const nextScrollTop = event.currentTarget.scrollTop

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current)
    }

    frameRef.current = window.requestAnimationFrame(() => {
      setScrollTop(nextScrollTop)
      frameRef.current = undefined
    })
  }, [])

  return (
    <div
      data-testid="nft-structure-virtual-scroll"
      onScroll={handleScroll}
      style={{
        height: maxHeight,
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        willChange: 'scroll-position',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ height, item, top }) => (
          <div
            key={item.key}
            style={{
              boxSizing: 'border-box',
              height,
              left: 0,
              overflow: 'hidden',
              paddingBottom: 6,
              paddingRight: 4,
              position: 'absolute',
              right: 0,
              top,
            }}
          >
            {renderVirtualStructureItem(item, borderColor)}
          </div>
        ))}
      </div>
    </div>
  )
})

const renderStructure = (items: TStructureVirtualItem[], maxHeight: number, borderColor: string) => {
  if (items.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No nftables structure found." />
  }

  return <StructureVirtualList borderColor={borderColor} items={items} maxHeight={maxHeight} />
}

export const SgroupsHostNftTab: FC<TSgroupsHostNftTabProps> = ({ data }) => {
  const { token } = antdTheme.useToken()
  const contentCardHeight = useContentCardHeight()
  const { clusterId: cluster, namespace, name } = data
  const [isLoading, setIsLoading] = useState(false)
  const [isComputingStructure, setIsComputingStructure] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [renderedView, setRenderedView] = useState<TNftView>('plain')
  const [latestNftList, setLatestNftList] = useState<TNftList | null>(null)
  const [plainResponse, setPlainResponse] = useState('')
  const [structureRows, setStructureRows] = useState<TNftSummaryRow[]>([])
  const [hasResolvedResponse, setHasResolvedResponse] = useState(false)
  const [watch, setWatch] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>()
  const [lastResourceVersion, setLastResourceVersion] = useState<string>()
  const [lastEndpoint, setLastEndpoint] = useState<string>()
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoSubmitRef = useRef(false)
  const cancelRowsComputeRef = useRef<() => void>()
  const cardMinHeight = Math.max(360, contentCardHeight - 170)
  const tableScrollY = Math.max(TABLE_MIN_SCROLL_Y, contentCardHeight - NFT_TABLE_SUBTRACT_HEIGHT)
  const editorHeight = Math.max(TABLE_MIN_SCROLL_Y, tableScrollY)
  const editorTheme = localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'vs'
  const structureItems = useMemo(() => flattenStructure(structureRows), [structureRows])
  const isContentLoading =
    (!hasResolvedResponse && (isLoading || isComputingStructure)) ||
    (renderedView === 'structure' && isComputingStructure)

  const stopWatch = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsWatching(false)
  }, [])

  useEffect(() => stopWatch, [stopWatch])

  useEffect(() => {
    return () => {
      cancelRowsComputeRef.current?.()
    }
  }, [])

  const scheduleStructureCompute = useCallback((payload: TNftList) => {
    cancelRowsComputeRef.current?.()

    setIsComputingStructure(true)

    cancelRowsComputeRef.current = scheduleAfterPaint(() => {
      setStructureRows(prepareStructureRows(buildSummaryRows(buildRows(payload.items))))
      setIsComputingStructure(false)
      cancelRowsComputeRef.current = undefined
    })
  }, [])

  const handleViewChange = useCallback(
    (nextView: TNftView) => {
      scheduleNextFrame(() => {
        setRenderedView(nextView)

        if (nextView === 'structure' && latestNftList) {
          setIsComputingStructure(true)
        }
      })
    },
    [latestNftList],
  )

  const applyNftList = useCallback((payload: TNftList) => {
    setLatestNftList(payload)
    setPlainResponse(buildPlainResponse(payload))
    setHasResolvedResponse(true)
    setLastResourceVersion(payload.metadata?.resourceVersion)
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  useEffect(() => {
    if (renderedView === 'structure' && latestNftList) {
      scheduleStructureCompute(latestNftList)
    }
  }, [latestNftList, renderedView, scheduleStructureCompute])

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
      cancelRowsComputeRef.current?.()
      cancelRowsComputeRef.current = undefined

      setStructureRows([])
      setLatestNftList(null)
      setPlainResponse('')
      setHasResolvedResponse(false)
      setIsComputingStructure(false)
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
          setHasResolvedResponse(true)
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

  let nftContent: React.ReactNode

  if (isContentLoading) {
    nftContent = (
      <Flex align="center" justify="center" style={{ minHeight: tableScrollY }}>
        <Spin />
      </Flex>
    )
  } else if (renderedView === 'plain') {
    nftContent = (
      <Editor
        beforeMount={configureNftMonaco}
        defaultLanguage={NFT_MONACO_LANGUAGE}
        height={editorHeight}
        value={plainResponse}
        theme={editorTheme}
        options={{
          minimap: { enabled: false },
          readOnly: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
      />
    )
  } else {
    nftContent = renderStructure(structureItems, tableScrollY, token.colorBorder)
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

        <Tabs
          defaultActiveKey="plain"
          items={[
            { key: 'plain', label: 'Plain' },
            { key: 'structure', label: 'Structure' },
          ]}
          onChange={key => handleViewChange(key as TNftView)}
        />

        {nftContent}
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
