/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

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
      EnrichedTable: ({
        dataSource,
        onRow,
      }: {
        dataSource: Array<{ key: string; metadata: { name?: string } }>
        onRow?: (record: any) => { onClick?: () => void }
      }) => (
        <div data-testid="hosts-table">
          {dataSource.map(record => (
            <button key={record.key} onClick={onRow?.(record).onClick} type="button">
              {record.metadata.name}
            </button>
          ))}
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
    render(<Hosts />)

    expect(screen.getByText('No cluster has been set')).toBeInTheDocument()
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: '', isEnabled: false, plural: 'hosts' }),
    )
  })

  it('renders table data, opens details on row click, and opens create modal', () => {
    render(<Hosts cluster="cluster-a" namespace="tenant-a" />)

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

  it('shows a loading error', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
    })

    render(<Hosts cluster="cluster-a" namespace="tenant-a" />)

    expect(screen.getByText('Failed to load hosts: Error: boom')).toBeInTheDocument()
  })
})
