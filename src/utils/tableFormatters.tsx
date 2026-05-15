import React, { ReactNode } from 'react'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const EMPTY_VALUE = '-'

const TRAFFIC_LABELS: Record<string, string> = {
  both: 'Both',
  ingress: 'Ingress',
  egress: 'Egress',
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const KUBECTL_ANNOTATION_PREFIX = 'kubectl.kubernetes.io/'

const fnv1a32 = (value: string): number => {
  const hash = [...value].reduce((acc, char) => {
    // eslint-disable-next-line no-bitwise
    const nextHash = acc ^ (char.codePointAt(0) || 0)

    // eslint-disable-next-line no-bitwise
    return (nextHash >>> 0) * 0x01000193
  }, 0x811c9dc5)

  // eslint-disable-next-line no-bitwise
  return hash >>> 0
}

const pickInRange = (value: number, min: number, max: number): number => min + (value % (max - min + 1))

const getBadgeColor = (value: string): string => {
  const hash = fnv1a32(value)
  const hue = hash % 345

  // eslint-disable-next-line no-bitwise
  const saturation = pickInRange(hash >>> 8, 90, 100)
  // eslint-disable-next-line no-bitwise
  const lightness = pickInRange(hash >>> 16, 78, 80)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const getBadgeText = (value: string): string => {
  const uppercases = [...value].filter(char => char >= 'A' && char <= 'Z').join('')

  return uppercases.length > 0 ? uppercases : value[0]?.toUpperCase() || ''
}

export const formatDateTime = (value?: string): string => {
  if (!value) {
    return EMPTY_VALUE
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return DATE_FORMATTER.format(parsed)
}

export const formatMapEntries = (value?: Record<string, string>): string[] => {
  if (!value) {
    return []
  }

  return Object.entries(value).map(([key, itemValue]) => `${key}: ${itemValue}`)
}

export const formatAnnotationEntries = (value?: Record<string, string>): string[] => {
  if (!value) {
    return []
  }

  return Object.entries(value)
    .filter(([key]) => !key.startsWith(KUBECTL_ANNOTATION_PREFIX))
    .map(([key, itemValue]) => `${key}: ${itemValue}`)
}

export const formatBooleanFlag = (value?: boolean): string => {
  if (typeof value !== 'boolean') {
    return EMPTY_VALUE
  }

  return value ? 'Enabled' : 'Disabled'
}

export const renderBooleanStatusIcon = (value?: boolean) => {
  if (typeof value !== 'boolean') {
    return EMPTY_VALUE
  }

  const label = formatBooleanFlag(value)
  const IconComponent = value ? CheckCircleOutlined : CloseCircleOutlined

  return React.createElement(
    'span',
    {
      'aria-label': label,
      role: 'img',
      title: label,
      style: {
        color: value ? '#52c41a' : '#ff4d4f',
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 16,
        lineHeight: 1,
      },
    },
    React.createElement(IconComponent, { 'aria-hidden': true }),
  )
}

export const normalizeTrafficValue = (value?: string) => {
  const normalizedValue = value?.toLowerCase()

  return normalizedValue && TRAFFIC_LABELS[normalizedValue]
    ? (TRAFFIC_LABELS[normalizedValue] as 'Both' | 'Ingress' | 'Egress')
    : undefined
}

export const formatTrafficValue = (value?: string): string => {
  const normalizedValue = normalizeTrafficValue(value)

  return normalizedValue || value || EMPTY_VALUE
}

export const renderBadge = (value: string) =>
  React.createElement(
    'span',
    {
      style: {
        backgroundColor: getBadgeColor(value),
        borderRadius: '10px',
        padding: '0 5px',
        minHeight: '20px',
        fontSize: '12px',
        lineHeight: '20px',
        height: 'min-content',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0,
        boxSizing: 'content-box',
        flexShrink: 0,
      },
    },
    getBadgeText(value),
  )

export const renderBadgeWithValue = (badgeValue: string, value?: ReactNode) =>
  React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 0,
      },
    },
    renderBadge(badgeValue),
    React.createElement(
      'span',
      { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } },
      value || EMPTY_VALUE,
    ),
  )

export const renderNamespaceBadgeWithValue = (value?: string) => renderBadgeWithValue('Namespace', value)

export const renderNamespacedResourceValue = (badgeValue: string, namespace?: string, value?: string) => {
  if (!namespace) {
    return renderBadgeWithValue(badgeValue, value)
  }

  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'nowrap',
        minWidth: 0,
        maxWidth: '100%',
        whiteSpace: 'nowrap',
      },
    },
    renderNamespaceBadgeWithValue(namespace),
    React.createElement('span', { style: { flexShrink: 0 } }, '/'),
    renderBadgeWithValue(badgeValue, value),
  )
}

export const renderTimestampWithIcon = (value?: string) =>
  React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      },
    },
    React.createElement('span', null, '🌐'),
    React.createElement('span', null, formatDateTime(value)),
  )

export const formatArrayForCell = (values?: string[]): string => {
  if (!values || values.length === 0) {
    return EMPTY_VALUE
  }

  return values.join(', ')
}
