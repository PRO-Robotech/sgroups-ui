/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { VerboseHostPanel } from './VerboseHostPanel'

describe('VerboseHostPanel', () => {
  it('renders host details, backend-owned IPs, refs, and expandable tag lists', () => {
    render(
      <VerboseHostPanel
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

    expect(screen.getAllByText('host-a').length).toBeGreaterThan(0)
    expect(screen.getByText('Host A')).toBeInTheDocument()
    expect(screen.getByText('Production host')).toBeInTheDocument()
    expect(screen.getByText('node-a')).toBeInTheDocument()
    expect(screen.getByText('linux')).toBeInTheDocument()
    expect(screen.getByText('ubuntu')).toBeInTheDocument()
    expect(screen.getByText('10.0.0.10')).toBeInTheDocument()
    expect(screen.getByText('2001:db8::10')).toBeInTheDocument()
    expect(screen.getByText('HostBinding / tenant-a / host-binding-a')).toBeInTheDocument()
    expect(screen.queryByText('label6: six')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Show more (1)'))

    expect(screen.getByText('label6: six')).toBeInTheDocument()
  })
})
