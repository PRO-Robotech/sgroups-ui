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

type ThemeMode = 'light' | 'dark'

const getThemeMode = (): ThemeMode => {
  if (typeof localStorage === 'undefined') {
    return 'light'
  }

  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
}

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

const getBadgeColor = (value: string, theme: ThemeMode = getThemeMode()): string => {
  const hash = fnv1a32(value)
  const hue = hash % 345

  const [saturationMin, saturationMax] = theme === 'light' ? [90, 100] : [78, 80]
  const [lightnessMin, lightnessMax] = theme === 'light' ? [78, 80] : [25, 35]

  // eslint-disable-next-line no-bitwise
  const saturation = pickInRange(hash >>> 8, saturationMin, saturationMax)
  // eslint-disable-next-line no-bitwise
  const lightness = pickInRange(hash >>> 16, lightnessMin, lightnessMax)

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

export const renderBadge = (value: string, displayValue = value) => {
  const badgeColor = getBadgeColor(value)

  return React.createElement(
    'span',
    {
      style: {
        backgroundColor: badgeColor,
        border: `1px solid ${badgeColor}`,
        borderRadius: '4px',
        padding: '0 7px',
        height: '22px',
        fontFamily: '"SF Pro", sans-serif',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0,
        boxSizing: 'border-box',
        flexShrink: 0,
      },
    },
    getBadgeText(displayValue),
  )
}

export const renderBadgeWithValue = (badgeValue: string, value?: ReactNode, displayBadgeValue = badgeValue) =>
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
    renderBadge(badgeValue, displayBadgeValue),
    React.createElement(
      'span',
      { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } },
      value || EMPTY_VALUE,
    ),
  )

export const renderNamespaceBadgeWithValue = (value?: string) => renderBadgeWithValue('Tenant', value)

export const renderNamespacedResourceValue = (badgeValue: string, namespace?: string, value?: ReactNode) => {
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
