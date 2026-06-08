/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

const mockUseK8sSmartResource = jest.fn()

jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => 'light'),
}))

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => {
    const ReactActual = jest.requireActual<typeof React>('react')

    return {
      ContentCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      DeleteModal: ({ endpoint, name }: { endpoint: string; name: string }) => (
        <div role="dialog">{`Delete modal ${name} ${endpoint}`}</div>
      ),
      EnrichedTable: ({
        columns,
        dataSource,
        onRow,
      }: {
        columns?: any[]
        dataSource: Array<{ key: string; metadata: { name?: string } }>
        onRow?: (record: any) => { onClick?: () => void }
      }) => (
        <div data-testid="hosts-table">
          {dataSource.map(record => {
            const actionsColumn = columns?.find(column => column.key === 'actions')

            return (
              <div key={record.key}>
                <button onClick={onRow?.(record).onClick} type="button">
                  {record.metadata.name}
                </button>
                {actionsColumn?.render?.(undefined, record)}
              </div>
            )
          })}
        </div>
      ),
      useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
      __esModule: true,
      default: ReactActual,
    }
  },
  { virtual: true },
)

jest.mock(
  'components',
  () => ({
    TenantSelector: ({ cluster, tenant }: { cluster?: string; tenant?: string }) => (
      <div data-testid="tenant-selector">{`${cluster || ''}:${tenant || ''}`}</div>
    ),
  }),
  { virtual: true },
)

jest.mock('./molecules', () => ({
  HostFormModal: ({ host }: { host?: { metadata?: { name?: string } } }) => (
    <div role="dialog">Host form {host?.metadata?.name || 'create'}</div>
  ),
  VerboseHostPanel: ({ host }: { host: { metadata: { name?: string } } }) => (
    <aside>Host details {host.metadata.name}</aside>
  ),
}))

import { Hosts } from './Hosts'

const LocationProbe = () => {
  const location = useLocation()

  return <div data-testid="location-path">{`${location.pathname}${location.hash}`}</div>
}

const renderHosts = (ui: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={['/hosts']}>
      <Routes>
        <Route
          path="/hosts"
          element={
            <>
              {ui}
              <LocationProbe />
            </>
          }
        />
        <Route path="/hosts/:namespace/:name" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  )

describe('Hosts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [
          {
            metadata: { name: 'host-a', namespace: 'tenant-a' },
            spec: { displayName: 'Host A', IPs: { IPv4: ['10.0.0.10'] } },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })
  })

  it('shows a guard when cluster is missing', () => {
    renderHosts(<Hosts />)

    expect(screen.getByText('No cluster has been set')).toBeInTheDocument()
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: '', isEnabled: false, plural: 'hosts' }),
    )
  })

  it('renders table data, opens details on row click, and opens create modal', () => {
    renderHosts(<Hosts cluster="cluster-a" namespace="tenant-a" />)

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        plural: 'hosts',
        isEnabled: true,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'host-a' }))

    expect(screen.getAllByText('Host details host-a')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /add host/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent('Host form create')
  })

  it('opens delete modal from the table action', async () => {
    renderHosts(<Hosts cluster="cluster-a" namespace="tenant-a" />)

    fireEvent.click(screen.getByRole('button', { name: /actions for host a/i }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /delete/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent('DeleteTtenant-a/HHost A')
  })

  it('routes to host socket stats from the table action', async () => {
    renderHosts(<Hosts cluster="cluster-a" namespace="tenant-a" />)

    fireEvent.click(screen.getByRole('button', { name: /actions for host a/i }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /socket stats/i }))

    expect(screen.getByTestId('location-path')).toHaveTextContent('/hosts/tenant-a/host-a#sockstats')
  })

  it('routes to host NFT from the table action', async () => {
    renderHosts(<Hosts cluster="cluster-a" namespace="tenant-a" />)

    fireEvent.click(screen.getByRole('button', { name: /actions for host a/i }))
    fireEvent.click(await screen.findByRole('menuitem', { name: /nft/i }))

    expect(screen.getByTestId('location-path')).toHaveTextContent('/hosts/tenant-a/host-a#nft')
  })

  it('shows a loading error', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
    })

    renderHosts(<Hosts cluster="cluster-a" namespace="tenant-a" />)

    expect(screen.getByText('Failed to load hosts: Error: boom')).toBeInTheDocument()
  })
})
