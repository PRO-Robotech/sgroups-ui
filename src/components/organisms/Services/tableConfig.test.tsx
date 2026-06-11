import React from 'react'
import { render, screen } from '@testing-library/react'
import { buildServicesColumns } from './tableConfig'

describe('Services table config', () => {
  it('renders Tenant column with tenant display name when available', () => {
    const tenantColumn = buildServicesColumns({
      namespaceDisplayLookup: { 'tenant-a': 'Tenant A' },
    }).find(column => column.key === 'namespace')

    render(<div>{tenantColumn?.render?.('tenant-a', {} as never, 0) as React.ReactNode}</div>)

    expect(screen.getByText('Tenant A')).toBeInTheDocument()
    expect(screen.queryByText('tenant-a')).not.toBeInTheDocument()
  })
})
