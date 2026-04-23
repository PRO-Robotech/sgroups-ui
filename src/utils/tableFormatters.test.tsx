import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  formatArrayForCell,
  formatBooleanFlag,
  formatDateTime,
  formatMapEntries,
  renderBadge,
  renderBadgeWithValue,
  renderTimestampWithIcon,
} from './tableFormatters'

describe('tableFormatters', () => {
  it('formats dates and falls back for empty or invalid values', () => {
    expect(formatDateTime()).toBe('-')
    expect(formatDateTime('not-a-date')).toBe('not-a-date')
    expect(formatDateTime('2026-04-23T12:30:00.000Z')).not.toBe('2026-04-23T12:30:00.000Z')
  })

  it('formats maps, booleans, and arrays for table cells', () => {
    expect(formatMapEntries()).toEqual([])
    expect(formatMapEntries({ env: 'prod', owner: 'netops' })).toEqual(['env: prod', 'owner: netops'])
    expect(formatBooleanFlag()).toBe('-')
    expect(formatBooleanFlag(true)).toBe('Enabled')
    expect(formatBooleanFlag(false)).toBe('Disabled')
    expect(formatArrayForCell()).toBe('-')
    expect(formatArrayForCell([])).toBe('-')
    expect(formatArrayForCell(['host-a', 'host-b'])).toBe('host-a, host-b')
  })

  it('renders a badge with uppercase initials from camel-case values', () => {
    render(<>{renderBadge('AddressGroup')}</>)

    expect(screen.getByText('AG')).toBeInTheDocument()
  })

  it('renders a badge with value and fallback placeholder', () => {
    const { rerender } = render(<>{renderBadgeWithValue('Service', 'tenant-a / api')}</>)

    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('tenant-a / api')).toBeInTheDocument()

    rerender(<>{renderBadgeWithValue('Service')}</>)

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders timestamps with an icon and formatted fallback', () => {
    const { rerender } = render(<>{renderTimestampWithIcon()}</>)

    expect(screen.getByText('🌐')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()

    rerender(<>{renderTimestampWithIcon('bad-date')}</>)

    expect(screen.getByText('bad-date')).toBeInTheDocument()
  })
})
