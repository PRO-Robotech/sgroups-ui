import fs from 'fs'
import path from 'path'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { buildRulesColumns } from './tableConfig'

describe('Rules table config', () => {
  it('keeps transport summary columns commented out of the active table', () => {
    const columnTitles = buildRulesColumns().map(column => column.title)

    expect(columnTitles).not.toContain('Protocol')
    expect(columnTitles).not.toContain('IP Family')
    expect(columnTitles).not.toContain('Ports / Types')
  })

  it('keeps the inactive transport summary column definitions in comments', () => {
    const source = fs.readFileSync(path.join(__dirname, 'tableConfig.ts'), 'utf8')

    expect(source).toContain("//   title: 'Protocol',")
    expect(source).toContain("//   title: 'IP Family',")
    expect(source).toContain("//   title: 'Ports / Types',")
  })

  it('renders Tenant column with tenant display name when available', () => {
    const tenantColumn = buildRulesColumns({
      namespaceDisplayLookup: { 'tenant-a': 'Tenant A' },
    }).find(column => column.key === 'namespace')

    const renderedTenant = tenantColumn?.render?.('tenant-a', {} as never, 0) as React.ReactNode

    render(<div>{renderedTenant}</div>)

    expect(screen.getByText('Tenant A')).toBeInTheDocument()
    expect(screen.queryByText('tenant-a')).not.toBeInTheDocument()
  })

  it('renders endpoint namespace badges with tenant display names when available', () => {
    const localColumn = buildRulesColumns({
      endpointDisplayLookup: { 'tenant-a/ag-a': 'Address Group A' },
      namespaceDisplayLookup: { 'tenant-a': 'Tenant A' },
    }).find(column => column.key === 'localEndpoint')

    const renderedLocal = localColumn?.render?.(
      undefined,
      {
        metadata: { name: 'rule-a', namespace: 'tenant-a' },
        spec: {
          endpoints: {
            local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
          },
        },
      } as never,
      0,
    ) as React.ReactNode

    render(<div>{renderedLocal}</div>)

    expect(screen.getByText('Tenant A')).toBeInTheDocument()
    expect(screen.getByText('Address Group A')).toBeInTheDocument()
    expect(screen.queryByText('tenant-a')).not.toBeInTheDocument()
  })
})
