import React, { ReactNode } from 'react'

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

const getBadgeColor = (value: string): string => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    // eslint-disable-next-line no-bitwise
    hash = value.charCodeAt(index) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360

  return `hsl(${hue} 55% 78%)`
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

export const formatBooleanFlag = (value?: boolean): string => {
  if (typeof value !== 'boolean') {
    return EMPTY_VALUE
  }

  return value ? 'Enabled' : 'Disabled'
}

export const normalizeTrafficValue = (value?: string) => {
  const normalizedValue = value?.toLowerCase()

  return normalizedValue && TRAFFIC_LABELS[normalizedValue]
    ? (normalizedValue as 'both' | 'ingress' | 'egress')
    : undefined
}

export const formatTrafficValue = (value?: string): string => {
  const normalizedValue = normalizeTrafficValue(value)

  return normalizedValue ? TRAFFIC_LABELS[normalizedValue] : value || EMPTY_VALUE
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
    React.createElement('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } }, value || EMPTY_VALUE),
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
