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

import { SgroupsHostDetailsSection } from './SgroupsHostDetailsSection'

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SgroupsHostDetailsSection data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'host-a' }} />
    </QueryClientProvider>,
  )
}

const hostResource = {
  metadata: {
    name: 'host-a',
    namespace: 'tenant-a',
    uid: 'uid-a',
    labels: { env: 'prod' },
    annotations: { note: 'keep' },
    creationTimestamp: '2026-05-17T16:45:00Z',
  },
  spec: {
    description: 'Host description',
    comment: 'Host comment',
    metaInfo: {
      hostName: 'node-a',
      os: 'Linux',
      platform: 'alpine',
      platformVersion: '3.22',
      kernelVersion: '5.15',
    },
    IPs: {
      IPv4: ['10.0.0.1'],
      IPv6: [],
    },
  },
}

describe('SgroupsHostDetailsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'hosts') {
        return { data: { items: [hostResource] }, error: undefined, isLoading: false }
      }

      return { data: undefined, error: undefined, isLoading: false }
    })
  })

  it('renders Host details without an assignments card', () => {
    renderWithQueryClient()

    expect(screen.queryByText('Assignments')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /address groups/i })).not.toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Meta info')).toBeInTheDocument()
    expect(screen.getAllByText('node-a')).toHaveLength(2)
    expect(screen.getByText('Host description')).toBeInTheDocument()
  })
})
