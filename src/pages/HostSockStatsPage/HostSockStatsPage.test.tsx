/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

const renderPage = async (cluster?: string, path = '/hosts/tenant-a/host-a/sockstats') => {
  let renderResult!: ReturnType<typeof render>

  await act(async () => {
    renderResult = render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/hosts/:namespace/:name/sockstats" element={<HostSockStatsPage cluster={cluster} />} />
        </Routes>
      </MemoryRouter>,
    )
  })

  return renderResult
}

const createWatchStream = (chunks: string[]) =>
  new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => {
        controller.enqueue(new TextEncoder().encode(chunk))
      })
      controller.close()
    },
  })

const mockWatchFetch = (snapshot: unknown, batches: unknown[]) => {
  const stream = new ReadableStream({
    start(controller) {
      batches.forEach(batch => {
        controller.enqueue(new TextEncoder().encode(`${JSON.stringify(batch)}\n`))
      })
      controller.close()
    },
  })

  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({
      json: async () => snapshot,
      ok: true,
    })
    .mockResolvedValueOnce({
      body: stream,
      ok: true,
    })
}

const mockRawWatchFetch = (snapshot: unknown, chunks: string[]) => {
  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({
      json: async () => snapshot,
      ok: true,
    })
    .mockResolvedValueOnce({
      body: createWatchStream(chunks),
      ok: true,
    })
}

const appendWatchFetch = (snapshot: unknown, batches: unknown[]) => {
  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({
      json: async () => snapshot,
      ok: true,
    })
    .mockResolvedValueOnce({
      body: createWatchStream(batches.map(batch => `${JSON.stringify(batch)}\n`)),
      ok: true,
    })
}

describe('HostSockStatsPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    global.TextDecoder = TextDecoder as typeof global.TextDecoder
    global.TextEncoder = TextEncoder as typeof global.TextEncoder
    jest.clearAllMocks()
  })

  it('shows a guard when cluster is missing', async () => {
    await renderPage(undefined)

    expect(screen.getByText('Cluster is required to open host socket stats.')).toBeInTheDocument()
  })

  it('starts watching with the default selector and renders rows', async () => {
    mockWatchFetch(
      {
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
      },
      [],
    )

    await renderPage('cluster-a')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/sockstats?selector=state%3DListen',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/sockstats?selector=state%3DListen&watch=true',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })

    expect(await screen.findByText('nginx (200)')).toBeInTheDocument()
    expect(screen.getByText(/rv 42/)).toBeInTheDocument()
  })

  it('does not render OR selector group controls', async () => {
    mockWatchFetch({ items: [] }, [])

    await renderPage('cluster-a')

    expect(screen.queryByRole('button', { name: /add or selector/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/selector 1/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add condition/i })).toBeInTheDocument()
  })

  it('replaces the table for each watch batch', async () => {
    mockWatchFetch({ items: [] }, [
      {
        items: [{ protocol: 'tcp', state: 'Listen', localPort: 80, processes: [{ pid: 200, comm: 'nginx' }] }],
      },
      {
        items: [{ protocol: 'udp', state: 'Established', localPort: 53, processes: [{ pid: 300, comm: 'dnsmasq' }] }],
      },
    ])

    await renderPage('cluster-a')

    expect(await screen.findByText('dnsmasq (300)')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('nginx (200)')).not.toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/sockstats?selector=state%3DListen&watch=true',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('renders Kubernetes-style watch events that wrap the SocketStatList in object', async () => {
    mockWatchFetch({ items: [] }, [
      {
        object: {
          metadata: { resourceVersion: '55' },
          items: [{ protocol: 'tcp', state: 'Listen', processes: [{ pid: 400, comm: 'wrapped' }] }],
        },
        type: 'MODIFIED',
      },
    ])

    await renderPage('cluster-a')

    expect(await screen.findByText('wrapped (400)')).toBeInTheDocument()
    expect(screen.getByText(/rv 55/)).toBeInTheDocument()
  })

  it('renders watch chunks without a trailing newline', async () => {
    mockRawWatchFetch({ items: [] }, [
      JSON.stringify({
        items: [{ protocol: 'tcp', state: 'Listen', processes: [{ pid: 401, comm: 'nonewline' }] }],
      }),
    ])

    await renderPage('cluster-a')

    expect(await screen.findByText('nonewline (401)')).toBeInTheDocument()
  })

  it('renders data-prefixed watch stream lines', async () => {
    mockRawWatchFetch({ items: [] }, [
      `data: ${JSON.stringify({
        items: [{ protocol: 'tcp', state: 'Listen', processes: [{ pid: 402, comm: 'sse' }] }],
      })}\n`,
    ])

    await renderPage('cluster-a')

    expect(await screen.findByText('sse (402)')).toBeInTheDocument()
  })

  it('clears stale rows when a new request returns no items', async () => {
    mockWatchFetch({ items: [{ protocol: 'tcp', state: 'Listen', processes: [{ pid: 200, comm: 'nginx' }] }] }, [])

    await renderPage('cluster-a')

    expect(await screen.findByText('nginx (200)')).toBeInTheDocument()

    appendWatchFetch({ items: [] }, [])
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.queryByText('nginx (200)')).not.toBeInTheDocument()
    })
  })
})
