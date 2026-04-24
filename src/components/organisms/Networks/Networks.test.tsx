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
        <div data-testid="networks-table">
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
  NetworkFormModal: ({ network }: { network?: { metadata?: { name?: string } } }) => (
    <div role="dialog">Network form {network?.metadata?.name || 'create'}</div>
  ),
  VerboseNetworkPanel: ({ network }: { network: { metadata: { name?: string } } }) => (
    <aside>Network details {network.metadata.name}</aside>
  ),
}))

import { Networks } from './Networks'

describe('Networks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [
          {
            metadata: { name: 'net-a', namespace: 'tenant-a' },
            spec: { displayName: 'Network A', CIDR: '10.0.0.0/24' },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })
  })

  it('shows a guard when cluster is missing', () => {
    render(<Networks />)

    expect(screen.getByText('No cluster has been set')).toBeInTheDocument()
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: '', isEnabled: false, plural: 'networks' }),
    )
  })

  it('renders table data, opens details on row click, and opens create modal', () => {
    render(<Networks cluster="cluster-a" namespace="tenant-a" />)

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        plural: 'networks',
        isEnabled: true,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'net-a' }))

    expect(screen.getAllByText('Network details net-a')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /add network/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent('Network form create')
  })

  it('opens delete modal from the table action', () => {
    render(<Networks cluster="cluster-a" namespace="tenant-a" />)

    fireEvent.click(screen.getByRole('button', { name: /delete net-a/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Delete modal tenant-a/net-a /api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/networks/net-a',
    )
  })

  it('shows a loading error', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
    })

    render(<Networks cluster="cluster-a" namespace="tenant-a" />)

    expect(screen.getByText('Failed to load networks: Error: boom')).toBeInTheDocument()
  })
})
