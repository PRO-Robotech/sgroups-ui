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

import { SgroupsServiceDetailsSection } from './SgroupsServiceDetailsSection'

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <SgroupsServiceDetailsSection data={{ clusterId: 'cluster-a', namespace: 'tenant-a', name: 'service-a' }} />
    </QueryClientProvider>,
  )
}

const serviceResource = {
  metadata: {
    name: 'service-a',
    namespace: 'tenant-a',
    uid: 'uid-service',
    labels: { env: 'prod' },
    annotations: { note: 'keep' },
    creationTimestamp: '2026-05-17T16:45:00Z',
  },
  spec: {
    description: 'Service description',
    comment: 'Service comment',
    transports: [
      {
        IPv: 'IPv4',
        protocol: 'TCP',
        entries: [{ ports: '80,443', description: 'HTTPS and HTTP' }],
      },
    ],
  },
}

describe('SgroupsServiceDetailsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural: string }) => {
      if (params.plural === 'services') {
        return { data: { items: [serviceResource] }, error: undefined, isLoading: false }
      }

      return { data: undefined, error: undefined, isLoading: false }
    })
  })

  it('renders Service details without an assignments card', () => {
    renderWithQueryClient()

    expect(screen.queryByText('Assignments')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /address groups/i })).not.toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Incoming ports')).toBeInTheDocument()
    expect(screen.getByText('80,443')).toBeInTheDocument()
    expect(screen.getByText('TCP')).toBeInTheDocument()
    expect(screen.getByText('HTTPS and HTTP')).toBeInTheDocument()
    expect(screen.queryByText('Meta info')).not.toBeInTheDocument()
  })
})
