/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

const mockUseK8sSmartResource = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    useK8sSmartResource: (...args: unknown[]) => mockUseK8sSmartResource(...args),
  }),
  { virtual: true },
)

// eslint-disable-next-line import/first
import { VerboseServicePanel } from './VerboseServicePanel'

const expandTreeNodes = (container: HTMLElement) => {
  Array.from(container.querySelectorAll('.ant-tree-switcher_close')).forEach(switcher => {
    fireEvent.click(switcher)
  })
}

describe('VerboseServicePanel', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    window.history.pushState({}, '', '/openapi-ui/cluster-a/plugins/plugin-sgroups/services/tenant-a/svc-a')
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: {
        items:
          // eslint-disable-next-line no-nested-ternary
          params.plural === 'servicebindings'
            ? [
                {
                  metadata: { name: 'service-binding-a', namespace: 'tenant-a' },
                  spec: {
                    service: { name: 'svc-a' },
                    addressGroup: { name: 'ag-a', namespace: 'tenant-a' },
                  },
                },
              ]
            : params.plural === 'addressgroups'
            ? [
                {
                  metadata: { name: 'ag-a', namespace: 'tenant-a' },
                  spec: { displayName: 'Address Group A' },
                },
              ]
            : [],
      },
      error: undefined,
      isLoading: false,
    }))
  })

  afterAll(() => {
    window.history.pushState({}, '', originalPathname)
  })

  it('renders service details, transport summaries, and refs', () => {
    const { container } = render(
      <VerboseServicePanel
        cluster="cluster-a"
        namespace="tenant-a"
        service={
          {
            metadata: {
              name: 'svc-a',
              namespace: 'tenant-a',
              labels: { app: 'api' },
              annotations: { owner: 'platform' },
            },
            spec: {
              displayName: 'Service A',
              description: 'API service',
              comment: 'External traffic',
              transports: [
                {
                  protocol: 'TCP',
                  IPv: 'IPv4',
                  entries: [{ ports: '443', description: 'https', comment: 'public' }],
                },
                {
                  protocol: 'ICMP',
                  IPv: 'IPv4',
                  entries: [{ types: [8, 0] }],
                },
              ],
            },
            refs: [{ kind: 'ServiceBinding', namespace: 'tenant-a', name: 'service-binding-a' }],
          } as any
        }
        namespaceDisplayLookup={{ 'tenant-a': 'Tenant A' }}
        onClose={jest.fn()}
        onExpand={jest.fn()}
        onCollapse={jest.fn()}
      />,
    )

    expect(screen.getByText('Service A')).toBeInTheDocument()
    expect(screen.getByText('Tenant A')).toBeInTheDocument()
    expect(screen.queryByText('Display Name')).not.toBeInTheDocument()
    expect(screen.getByText('API service')).toBeInTheDocument()
    expect(screen.getByText('app: api')).toBeInTheDocument()
    expect(screen.getByText('owner: platform')).toBeInTheDocument()
    expect(screen.getByText('TCP / IPv4')).toBeInTheDocument()
    expect(screen.getByText(/Ports: 443/)).toBeInTheDocument()
    expect(screen.queryByText(/Description: https/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Comment: public/)).not.toBeInTheDocument()
    expect(screen.getByText('ICMP / IPv4')).toBeInTheDocument()
    expect(screen.getByText(/Types: 8, 0/)).toBeInTheDocument()
    expect(screen.getAllByText('Bound Address Groups').length).toBeGreaterThan(0)
    expect(screen.queryByText('Address Group A')).not.toBeInTheDocument()

    expandTreeNodes(container)

    expect(screen.getByText('Address Group A')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open tenant-a/ag-a details' })).toHaveAttribute(
      'href',
      '/openapi-ui/cluster-a/plugins/plugin-sgroups/addressgroups/tenant-a/ag-a',
    )
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ plural: 'servicebindings', namespace: 'tenant-a' }),
    )
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ plural: 'addressgroups', namespace: undefined }),
    )
  })
})
