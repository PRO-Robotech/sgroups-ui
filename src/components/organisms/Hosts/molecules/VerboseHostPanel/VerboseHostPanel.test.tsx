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
import { VerboseHostPanel } from './VerboseHostPanel'

const expandTreeNodes = (container: HTMLElement) => {
  Array.from(container.querySelectorAll('.ant-tree-switcher_close')).forEach(switcher => {
    fireEvent.click(switcher)
  })
}

describe('VerboseHostPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseK8sSmartResource.mockImplementation((params: { plural?: string }) => ({
      data: {
        items:
          // eslint-disable-next-line no-nested-ternary
          params.plural === 'hostbindings'
            ? [
                {
                  metadata: { name: 'host-binding-a', namespace: 'tenant-a' },
                  spec: {
                    host: { name: 'host-a', namespace: 'tenant-a' },
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

  it('renders host details, backend-owned IPs, refs, and expandable tag lists', () => {
    const { container } = render(
      <VerboseHostPanel
        cluster="cluster-a"
        namespace="tenant-a"
        host={
          {
            metadata: {
              name: 'host-a',
              namespace: 'tenant-a',
              labels: {
                label1: 'one',
                label2: 'two',
                label3: 'three',
                label4: 'four',
                label5: 'five',
                label6: 'six',
              },
              annotations: { owner: 'platform' },
            },
            spec: {
              displayName: 'Host A',
              description: 'Production host',
              comment: 'Managed by agent',
              IPs: {
                IPv4: ['10.0.0.10'],
                IPv6: ['2001:db8::10'],
              },
              metaInfo: {
                hostName: 'node-a',
                os: 'linux',
                platform: 'ubuntu',
                platformFamily: 'debian',
                platformVersion: '22.04',
                kernelVersion: '6.1.0',
              },
            },
            refs: [{ kind: 'HostBinding', namespace: 'tenant-a', name: 'host-binding-a' }],
          } as any
        }
        onClose={jest.fn()}
        onExpand={jest.fn()}
        onCollapse={jest.fn()}
      />,
    )

    expect(screen.getByText('Host A')).toBeInTheDocument()
    expect(screen.queryByText('Display Name')).not.toBeInTheDocument()
    expect(screen.getByText('Production host')).toBeInTheDocument()
    expect(screen.getByText('node-a')).toBeInTheDocument()
    expect(screen.getByText('linux')).toBeInTheDocument()
    expect(screen.getByText('ubuntu')).toBeInTheDocument()
    expect(screen.getByText('10.0.0.10')).toBeInTheDocument()
    expect(screen.getByText('2001:db8::10')).toBeInTheDocument()
    expect(screen.getAllByText('Bound Address Groups').length).toBeGreaterThan(0)
    expect(screen.queryByText('Address Group A')).not.toBeInTheDocument()

    expandTreeNodes(container)

    expect(screen.getByText('Address Group A')).toBeInTheDocument()
    expect(screen.queryByText('label6: six')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Show more (1)'))

    expect(screen.getByText('label6: six')).toBeInTheDocument()
  })
})
