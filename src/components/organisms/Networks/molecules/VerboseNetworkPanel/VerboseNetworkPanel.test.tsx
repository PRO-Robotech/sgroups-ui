/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
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
import { VerboseNetworkPanel } from './VerboseNetworkPanel'

const expandTreeNodes = (container: HTMLElement) => {
  Array.from(container.querySelectorAll('.ant-tree-switcher_close')).forEach(switcher => {
    fireEvent.click(switcher)
  })
}

describe('VerboseNetworkPanel', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    window.history.pushState({}, '', '/openapi-ui/cluster-a/plugins/plugin-sgroups/networks/tenant-a/net-a')
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: {
        items:
          params.plural === 'networkbindings'
            ? [
                {
                  metadata: { name: 'network-binding-a', namespace: 'tenant-a' },
                  spec: {
                    network: { name: 'net-a' },
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

  it('renders network details, refs, and bound address groups', () => {
    const { container } = render(
      <VerboseNetworkPanel
        cluster="cluster-a"
        namespace="tenant-a"
        network={
          {
            metadata: {
              name: 'net-a',
              namespace: 'tenant-a',
              labels: { env: 'prod' },
              annotations: { owner: 'netops' },
            },
            spec: {
              displayName: 'Network A',
              CIDR: '10.0.0.0/24',
              description: 'Production subnet',
              comment: 'Static range',
            },
            refs: [{ kind: 'NetworkBinding', namespace: 'tenant-a', name: 'network-binding-a' }],
          } as any
        }
        onClose={jest.fn()}
        onExpand={jest.fn()}
        onCollapse={jest.fn()}
      />,
    )

    expect(screen.getByText('Network A')).toBeInTheDocument()
    expect(screen.queryByText('Display Name')).not.toBeInTheDocument()
    expect(screen.getByText('10.0.0.0/24')).toBeInTheDocument()
    expect(screen.getByText('Production subnet')).toBeInTheDocument()
    expect(screen.getByText('env: prod')).toBeInTheDocument()
    expect(screen.getByText('owner: netops')).toBeInTheDocument()
    expect(screen.queryByText('Address Group A')).not.toBeInTheDocument()

    expandTreeNodes(container)

    expect(screen.getByText('Address Group A')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open tenant-a/ag-a details' })).toHaveAttribute(
      'href',
      '/openapi-ui/cluster-a/plugins/plugin-sgroups/addressgroups/tenant-a/ag-a',
    )
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ plural: 'networkbindings', namespace: 'tenant-a' }),
    )
    expect(mockUseK8sSmartResource).toHaveBeenCalledWith(
      expect.objectContaining({ plural: 'addressgroups', namespace: undefined }),
    )
  })
})
