/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ReadableStream } from 'stream/web'
import { TextDecoder, TextEncoder } from 'util'

jest.mock('components/molecules', () => ({
  SgroupsPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('hooks/useContentCardHeight', () => ({
  useContentCardHeight: () => 720,
}))

import { HostSockStatsPage } from './HostSockStatsPage'

const renderPage = (cluster?: string, path = '/hosts/tenant-a/host-a/sockstats') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/hosts/:namespace/:name/sockstats" element={<HostSockStatsPage cluster={cluster} />} />
      </Routes>
    </MemoryRouter>,
  )

const mockFetch = (response: unknown) => {
  ;(global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => response,
  })
}

describe('HostSockStatsPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    global.TextDecoder = TextDecoder as typeof global.TextDecoder
    global.TextEncoder = TextEncoder as typeof global.TextEncoder
    jest.clearAllMocks()
  })

  it('shows a guard when cluster is missing', () => {
    renderPage(undefined)

    expect(screen.getByText('Cluster is required to open host socket stats.')).toBeInTheDocument()
  })

  it('submits the default selector and renders snapshot rows', async () => {
    mockFetch({
      metadata: { resourceVersion: '42' },
      items: [
        {
          protocol: 'tcp',
          family: 'IPv4',
          state: 'Listen',
          localAddr: '0.0.0.0',
          localPort: 80,
          remoteAddr: '',
          remotePort: 0,
          ifname: 'eth0',
          inode: 123,
          processes: [{ pid: 200, comm: 'nginx' }],
        },
      ],
    })

    renderPage('cluster-a')
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/sockstats?selector=state%3DListen',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })

    expect(await screen.findByText('nginx (200)')).toBeInTheDocument()
    expect(screen.getByText(/rv 42/)).toBeInTheDocument()
  })

  it('replaces the table for each watch batch', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `${JSON.stringify({
              items: [{ protocol: 'tcp', state: 'Listen', localPort: 80, processes: [{ pid: 200, comm: 'nginx' }] }],
            })}\n`,
          ),
        )
        controller.enqueue(
          new TextEncoder().encode(
            `${JSON.stringify({
              items: [
                { protocol: 'udp', state: 'Established', localPort: 53, processes: [{ pid: 300, comm: 'dnsmasq' }] },
              ],
            })}\n`,
          ),
        )
        controller.close()
      },
    })

    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: stream,
      ok: true,
    })

    renderPage('cluster-a')
    fireEvent.click(screen.getByRole('switch'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText('dnsmasq (300)')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('nginx (200)')).not.toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/sockstats?selector=state%3DListen&watch=true',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
})
