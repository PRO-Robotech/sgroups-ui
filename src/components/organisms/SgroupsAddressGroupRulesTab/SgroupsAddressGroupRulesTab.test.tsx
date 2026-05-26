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

import { SgroupsAddressGroupRulesTab } from './SgroupsAddressGroupRulesTab'

const rules = [
  {
    metadata: { name: 'rule-from', namespace: 'tenant-a', creationTimestamp: '2026-05-01T10:00:00Z' },
    spec: {
      displayName: 'Allow from Admin Segment',
      endpoints: {
        local: { type: 'AddressGroup', name: 'ag-admin', namespace: 'tenant-a' },
        remote: { type: 'Service', name: 'svc-api', namespace: 'tenant-a' },
      },
    },
  },
  {
    metadata: { name: 'rule-to', namespace: 'tenant-a', creationTimestamp: '2026-05-02T10:00:00Z' },
    spec: {
      displayName: 'Allow to Admin Segment',
      endpoints: {
        local: { type: 'AddressGroup', name: 'ag-web', namespace: 'tenant-a' },
        remote: { type: 'AddressGroup', name: 'ag-admin', namespace: 'tenant-a' },
      },
    },
  },
  {
    metadata: { name: 'rule-other', namespace: 'tenant-a', creationTimestamp: '2026-05-03T10:00:00Z' },
    spec: {
      displayName: 'Other Segment Rule',
      endpoints: {
        local: { type: 'AddressGroup', name: 'ag-other', namespace: 'tenant-a' },
        remote: { type: 'Service', name: 'svc-api', namespace: 'tenant-a' },
      },
    },
  },
]

describe('SgroupsAddressGroupRulesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockReturnValue({
      data: { items: rules },
      error: undefined,
      isLoading: false,
    })
  })

  it('shows rules from the current AddressGroup by default', () => {
    render(<SgroupsAddressGroupRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-admin' }} />)

    expect(screen.getByText('Allow from Admin Segment')).toBeInTheDocument()
    expect(screen.queryByText('Allow to Admin Segment')).not.toBeInTheDocument()
    expect(screen.queryByText('Other Segment Rule')).not.toBeInTheDocument()
  })

  it('switches to rules targeting the current AddressGroup', () => {
    render(<SgroupsAddressGroupRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-admin' }} />)

    fireEvent.click(screen.getByText('Rules to'))

    expect(screen.getByText('Allow to Admin Segment')).toBeInTheDocument()
    expect(screen.queryByText('Allow from Admin Segment')).not.toBeInTheDocument()
  })

  it('opens create rule modal from the add button', () => {
    render(<SgroupsAddressGroupRulesTab data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'ag-admin' }} />)

    fireEvent.click(within(screen.getByRole('button', { name: /add/i })).getByText('Add'))

    expect(screen.getByText('Create UniRule Modal')).toBeInTheDocument()
    expect(mockUniRuleFormModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cluster: 'cluster-a',
        namespace: 'tenant-a',
        open: true,
      }),
    )
  })
})
