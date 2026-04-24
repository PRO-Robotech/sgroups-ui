/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen } from '@testing-library/react'

import { VerboseServicePanel } from './VerboseServicePanel'

describe('VerboseServicePanel', () => {
  it('renders service details, transport summaries, and refs', () => {
    render(
      <VerboseServicePanel
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
        onClose={jest.fn()}
        onExpand={jest.fn()}
        onCollapse={jest.fn()}
      />,
    )

    expect(screen.getAllByText('svc-a').length).toBeGreaterThan(0)
    expect(screen.getByText('Service A')).toBeInTheDocument()
    expect(screen.getByText('API service')).toBeInTheDocument()
    expect(screen.getByText('app: api')).toBeInTheDocument()
    expect(screen.getByText('owner: platform')).toBeInTheDocument()
    expect(screen.getByText(/TCP \/ IPv4:/)).toBeInTheDocument()
    expect(screen.getByText(/Ports: 443/)).toBeInTheDocument()
    expect(screen.getByText(/ICMP \/ IPv4:/)).toBeInTheDocument()
    expect(screen.getByText(/Types: 8, 0/)).toBeInTheDocument()
    expect(screen.getByText('ServiceBinding / tenant-a / service-binding-a')).toBeInTheDocument()
  })
})
