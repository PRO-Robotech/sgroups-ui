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
        <div data-testid="rules-table">
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
  UniRuleFormModal: ({ rule }: { rule?: { metadata?: { name?: string } } }) => (
    <div role="dialog">Rule form {rule?.metadata?.name || 'create'}</div>
  ),
  VerboseRulePanel: ({ rule }: { rule: { metadata: { name?: string } } }) => (
    <aside>Rule details {rule.metadata.name}</aside>
  ),
}))

import { Rules } from './Rules'

describe('Rules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: {
        items: [
          {
            metadata: { name: 'rule-a', namespace: 'tenant-a' },
            spec: {
              displayName: 'Rule A',
              action: 'Allow',
              session: { traffic: 'Both' },
              endpoints: {
                local: { type: 'AddressGroup', name: 'ag-a', namespace: 'tenant-a' },
                remote: { type: 'Service', name: 'svc-a', namespace: 'tenant-a' },
              },
            },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })
  })

  it('shows a guard when cluster is missing', () => {
    render(<Rules />)

    expect(screen.getByText('No cluster has been set')).toBeInTheDocument()
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: '', isEnabled: false, plural: 'rules' }),
    )
  })

  it('renders table data, opens details on row click, and opens create modal', () => {
    render(<Rules cluster="cluster-a" namespace="tenant-a" />)

    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        plural: 'rules',
        isEnabled: true,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'rule-a' }))

    expect(screen.getAllByText('Rule details rule-a')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /add unirule/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent('Rule form create')
  })

  it('opens delete modal from the table action', () => {
    render(<Rules cluster="cluster-a" namespace="tenant-a" />)

    fireEvent.click(screen.getByRole('button', { name: /delete rule-a/i }))

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Delete modal tenant-a/rule-a /api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/rules/rule-a',
    )
  })

  it('shows a loading error', () => {
    mockUseK8sSmartResource.mockReturnValue({
      data: undefined,
      error: new Error('boom'),
      isLoading: false,
    })

    render(<Rules cluster="cluster-a" namespace="tenant-a" />)

    expect(screen.getByText('Failed to load rules: Error: boom')).toBeInTheDocument()
  })
})
