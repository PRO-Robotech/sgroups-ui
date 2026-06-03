/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

const mockUseK8sSmartResource = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    patchEntryWithReplaceOp: jest.fn(),
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/AddressGroups/molecules', () => ({
  AddressGroupFormModal: ({ open }: { open: boolean }) => (open ? <div>AddressGroup full edit modal</div> : null),
}))

jest.mock('components/organisms/Hosts/molecules', () => ({
  HostFormModal: ({ open }: { open: boolean }) => (open ? <div>Host full edit modal</div> : null),
}))

jest.mock('components/organisms/Networks/molecules', () => ({
  NetworkFormModal: ({ open }: { open: boolean }) => (open ? <div>Network full edit modal</div> : null),
}))

jest.mock('components/organisms/Rules/molecules', () => ({
  UniRuleFormModal: ({ open }: { open: boolean }) => (open ? <div>Rule full edit modal</div> : null),
}))

jest.mock('components/organisms/Services/molecules', () => ({
  ServiceFormModal: ({ open }: { open: boolean }) => (open ? <div>Service full edit modal</div> : null),
}))

jest.mock('utils/SgroupsDeleteModal', () => ({
  SgroupsDeleteModal: () => <div>Delete modal</div>,
}))

import { SgroupsResourceActionsDropdown, TSgroupsResourceActionsDropdownData } from './SgroupsResourceActionsDropdown'

const LocationProbe = () => {
  const location = useLocation()

  return <div data-testid="location-path">{location.pathname}</div>
}

const renderDropdown = (data: TSgroupsResourceActionsDropdownData) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <MemoryRouter initialEntries={[`/${data.plural}/${data.namespace}/${data.name}`]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="/:plural/:namespace/:name"
            element={
              <>
                <SgroupsResourceActionsDropdown data={data} />
                <LocationProbe />
              </>
            }
          />
          <Route path="/:plural/:namespace/:name/sockstats" element={<LocationProbe />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

const cases: Array<{
  data: TSgroupsResourceActionsDropdownData
  modalText: string
  resource: Record<string, any>
}> = [
  {
    data: {
      clusterId: 'cluster-a',
      endpoint: '/addressgroups/ag-a',
      kind: 'AddressGroup',
      name: 'ag-a',
      namespace: 'tenant-a',
      plural: 'addressgroups',
    },
    modalText: 'AddressGroup full edit modal',
    resource: {
      metadata: { name: 'ag-a', namespace: 'tenant-a' },
      spec: { displayName: 'AG A', defaultAction: 'Deny' },
    },
  },
  {
    data: {
      clusterId: 'cluster-a',
      endpoint: '/hosts/host-a',
      kind: 'Host',
      name: 'host-a',
      namespace: 'tenant-a',
      plural: 'hosts',
    },
    modalText: 'Host full edit modal',
    resource: {
      metadata: { name: 'host-a', namespace: 'tenant-a' },
      spec: { displayName: 'Host A' },
    },
  },
  {
    data: {
      clusterId: 'cluster-a',
      endpoint: '/networks/network-a',
      kind: 'Network',
      name: 'network-a',
      namespace: 'tenant-a',
      plural: 'networks',
    },
    modalText: 'Network full edit modal',
    resource: {
      metadata: { name: 'network-a', namespace: 'tenant-a' },
      spec: { CIDR: '10.0.0.0/24', displayName: 'Network A' },
    },
  },
  {
    data: {
      clusterId: 'cluster-a',
      endpoint: '/rules/rule-a',
      kind: 'Rule',
      name: 'rule-a',
      namespace: 'tenant-a',
      plural: 'rules',
    },
    modalText: 'Rule full edit modal',
    resource: {
      metadata: { name: 'rule-a', namespace: 'tenant-a' },
      spec: { action: 'Allow', displayName: 'Rule A' },
    },
  },
  {
    data: {
      clusterId: 'cluster-a',
      endpoint: '/services/service-a',
      kind: 'Service',
      name: 'service-a',
      namespace: 'tenant-a',
      plural: 'services',
    },
    modalText: 'Service full edit modal',
    resource: {
      metadata: { name: 'service-a', namespace: 'tenant-a' },
      spec: { displayName: 'Service A', transports: [] },
    },
  },
]

describe('SgroupsResourceActionsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each(cases)(
    'opens the full $data.kind edit modal from the actions dropdown',
    async ({ data, modalText, resource }) => {
      mockUseK8sSmartResource.mockReturnValue({
        data: { items: [resource] },
        isLoading: false,
      })

      renderDropdown(data)

      fireEvent.click(screen.getByRole('button', { name: /actions/i }))
      fireEvent.click(await screen.findByText(`Edit ${data.kind}`))

      await waitFor(() => expect(screen.getByText(modalText)).toBeInTheDocument())
    },
  )

  it('routes to socket stats from the Host actions dropdown', async () => {
    const hostCase = cases.find(item => item.data.plural === 'hosts')

    if (!hostCase) {
      throw new Error('Host case is missing')
    }

    mockUseK8sSmartResource.mockReturnValue({
      data: { items: [hostCase.resource] },
      isLoading: false,
    })

    renderDropdown(hostCase.data)

    fireEvent.click(screen.getByRole('button', { name: /actions/i }))
    fireEvent.click(await screen.findByText('Socket Stats'))

    expect(screen.getByTestId('location-path')).toHaveTextContent('/hosts/tenant-a/host-a/sockstats')
  })
})
