/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()
const mockUniRuleFormModal = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/Rules/molecules', () => ({
  UniRuleFormModal: (props: any) => {
    const { open } = props

    mockUniRuleFormModal(props)

    return open ? <div>Create UniRule Modal</div> : null
  },
}))

jest.mock('utils', () => ({
  formatDateTime: (value?: string) => value || '-',
  renderLinkedResourceBadge: ({ displayValue }: { displayValue: string }) => <a href="/rule">{displayValue}</a>,
  renderTimestampWithIcon: (value?: string) => value || '-',
}))

import { SgroupsServiceRulesTab } from './SgroupsServiceRulesTab'

const rules = [
  {
    metadata: { name: 'rule-from', namespace: 'tenant-a', creationTimestamp: '2026-05-01T10:00:00Z' },
    spec: {
      displayName: 'Allow from API',
      endpoints: {
        local: { type: 'Service', name: 'service-a', namespace: 'tenant-a' },
        remote: { type: 'AddressGroup', name: 'ag-web', namespace: 'tenant-a' },
      },
    },
  },
  {
    metadata: { name: 'rule-to', namespace: 'tenant-a', creationTimestamp: '2026-05-02T10:00:00Z' },
    spec: {
      displayName: 'Allow to API',
      endpoints: {
        local: { type: 'AddressGroup', name: 'ag-admin', namespace: 'tenant-a' },
        remote: { type: 'Service', name: 'service-a', namespace: 'tenant-a' },
      },
    },
  },
  {
    metadata: { name: 'rule-other', namespace: 'tenant-a', creationTimestamp: '2026-05-03T10:00:00Z' },
    spec: {
      displayName: 'Other Service Rule',
      endpoints: {
        local: { type: 'Service', name: 'service-b', namespace: 'tenant-a' },
        remote: { type: 'AddressGroup', name: 'ag-web', namespace: 'tenant-a' },
      },
    },
  },
]

describe('SgroupsServiceRulesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: { items: rules },
      error: undefined,
      isLoading: false,
    })
  })

  it('shows rules from the current Service by default', () => {
    render(<SgroupsServiceRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />)

    expect(screen.getByText('Allow from API')).toBeInTheDocument()
    expect(screen.queryByText('Allow to API')).not.toBeInTheDocument()
    expect(screen.queryByText('Other Service Rule')).not.toBeInTheDocument()
  })

  it('switches to rules targeting the current Service', () => {
    render(<SgroupsServiceRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />)

    fireEvent.click(screen.getByText('Rules to'))

    expect(screen.getByText('Allow to API')).toBeInTheDocument()
    expect(screen.queryByText('Allow from API')).not.toBeInTheDocument()
  })

  it('opens create rule modal from the add button', () => {
    render(<SgroupsServiceRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />)

    fireEvent.click(within(screen.getByRole('button', { name: /add/i })).getByText('Add'))

    expect(screen.getByText('Create UniRule Modal')).toBeInTheDocument()
    expect(mockUniRuleFormModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        initialValues: {
          local: {
            name: 'service-a',
            namespace: 'tenant-a',
            type: 'Service',
          },
        },
        namespace: 'tenant-a',
        open: true,
      }),
    )
  })

  it('prefills the remote endpoint when adding from Rules to', () => {
    render(<SgroupsServiceRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />)

    fireEvent.click(screen.getByText('Rules to'))
    fireEvent.click(within(screen.getByRole('button', { name: /add/i })).getByText('Add'))

    expect(mockUniRuleFormModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        initialValues: {
          remote: {
            name: 'service-a',
            namespace: 'tenant-a',
            type: 'Service',
          },
        },
      }),
    )
  })
})
