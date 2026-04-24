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
        <div data-testid="services-table">
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
  ServiceFormModal: ({ service }: { service?: { metadata?: { name?: string } } }) => (
    <div role="dialog">Service form {service?.metadata?.name || 'create'}</div>
  ),
  VerboseServicePanel: ({ service }: { service: { metadata: { name?: string } } }) => (
    <aside>Service details {service.metadata.name}</aside>
  ),
}))

import { Services } from './Services'

describe('Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [
          {
            metadata: { name: 'svc-a', namespace: 'tenant-a' },
            spec: {
              displayName: 'Service A',
              transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '443' }] }],
            },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })
  })

  it('shows a guard when cluster is missing', () => {
    render(<Services />)

    expect(screen.getByText('No cluster has been set')).toBeInTheDocument()
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: '', isEnabled: false, plural: 'services' }),
    )
  })

  it('renders table data, opens details on row click, and opens create modal', () => {
    render(<Services cluster="cluster-a" namespace="tenant-a" />)

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        plural: 'services',
        isEnabled: true,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'svc-a' }))

    expect(screen.getAllByText('Service details svc-a')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /add service/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent('Service form create')
  })

  it('opens delete modal from the table action', () => {
    render(<Services cluster="cluster-a" namespace="tenant-a" />)

    fireEvent.click(screen.getByRole('button', { name: /delete svc-a/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Delete modal tenant-a/svc-a /api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/services/svc-a',
    )
  })

  it('shows a loading error', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
    })

    render(<Services cluster="cluster-a" namespace="tenant-a" />)

    expect(screen.getByText('Failed to load services: Error: boom')).toBeInTheDocument()
  })
})
