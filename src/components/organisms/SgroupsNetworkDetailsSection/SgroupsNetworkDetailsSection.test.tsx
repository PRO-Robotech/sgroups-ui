/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

import { SgroupsNetworkDetailsSection } from './SgroupsNetworkDetailsSection'

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SgroupsNetworkDetailsSection data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'network-a' }} />
    </QueryClientProvider>,
  )
}

const networkResource = {
  metadata: {
    name: 'network-a',
    namespace: 'tenant-a',
    uid: 'uid-network',
    labels: { env: 'prod' },
    annotations: { note: 'keep' },
    creationTimestamp: '2026-05-17T16:45:00Z',
  },
  spec: {
    CIDR: '10.0.0.0/24',
    description: 'Network description',
    comment: 'Network comment',
  },
}

describe('SgroupsNetworkDetailsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'networks') {
        return { data: { items: [networkResource] }, error: undefined, isLoading: false }
      }

      return { data: undefined, error: undefined, isLoading: false }
    })
  })

  it('renders Network details without an assignments card', () => {
    renderWithQueryClient()

    expect(screen.queryByText('Assignments')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /address groups/i })).not.toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('10.0.0.0/24')).toBeInTheDocument()
    expect(screen.getByText('Network description')).toBeInTheDocument()
  })
})
