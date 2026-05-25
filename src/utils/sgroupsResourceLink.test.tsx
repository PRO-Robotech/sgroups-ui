import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  getInternalSgroupsResourceHref,
  renderLinkedResourceBadge,
  renderLinkedTreeResourceTitle,
} from './sgroupsResourceLink'

describe('sgroupsResourceLink', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    window.history.pushState({}, '', '/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts')
  })

  afterAll(() => {
    window.history.pushState({}, '', originalPathname)
  })

  it('builds internal detail links with metadata identifiers', () => {
    expect(
      getInternalSgroupsResourceHref({
        name: 'host-a',
        namespace: 'tenant-a',
        plural: 'hosts',
      }),
    ).toBe('/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts/tenant-a/host-a')
  })

  it('does not build links without namespace or name', () => {
    expect(getInternalSgroupsResourceHref({ name: 'host-a', plural: 'hosts' })).toBeUndefined()
    expect(getInternalSgroupsResourceHref({ namespace: 'tenant-a', plural: 'hosts' })).toBeUndefined()
  })

  it('renders display names as links and stops row-click propagation', () => {
    const onClick = jest.fn()

    render(
      <MemoryRouter>
        <div onClick={onClick}>
          {renderLinkedResourceBadge({
            badgeValue: 'Host',
            displayValue: 'Production Host',
            name: 'host-a',
            namespace: 'tenant-a',
            plural: 'hosts',
          })}
        </div>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Production Host' })

    expect(link).toHaveAttribute('href', '/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts/tenant-a/host-a')

    fireEvent.click(link)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders tree titles with a detail link icon', () => {
    const onClick = jest.fn()

    render(
      <MemoryRouter>
        <div onClick={onClick}>
          {renderLinkedTreeResourceTitle({
            label: <span>Host A</span>,
            name: 'host-a',
            namespace: 'tenant-a',
            plural: 'hosts',
          })}
        </div>
      </MemoryRouter>,
    )

    expect(screen.getByText('Host A')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Open tenant-a/host-a details' })

    expect(link).toHaveAttribute('href', '/openapi-ui/cluster-a/plugins/plugin-sgroups/hosts/tenant-a/host-a')
    expect(link).toHaveAttribute('title', 'Open details')

    fireEvent.click(link)

    expect(onClick).not.toHaveBeenCalled()
  })
})
