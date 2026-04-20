import React from 'react'

const EMPTY_VALUE = '-'

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

export const renderBadge = (value: string) =>
  React.createElement(
    'span',
    {
      style: {
        backgroundColor: getBadgeColor(value),
        borderRadius: '13px',
        padding: '1px 5px',
        fontSize: '13px',
        height: 'min-content',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        boxSizing: 'content-box',
      },
    },
    getBadgeText(value),
  )

export const renderBadgeWithValue = (badgeValue: string, value?: string) =>
  React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      },
    },
    renderBadge(badgeValue),
    React.createElement('span', null, value || EMPTY_VALUE),
  )

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
