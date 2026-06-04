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

import { HostNftPage } from './HostNftPage'

const renderPage = async (cluster?: string, path = '/hosts/tenant-a/host-a/nft') => {
  let renderResult!: ReturnType<typeof render>

  await act(async () => {
    renderResult = render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/hosts/:namespace/:name/nft" element={<HostNftPage cluster={cluster} />} />
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

describe('HostNftPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    global.TextDecoder = TextDecoder as typeof global.TextDecoder
    global.TextEncoder = TextEncoder as typeof global.TextEncoder
    jest.clearAllMocks()
  })

  it('shows a guard when cluster is missing', async () => {
    await renderPage(undefined)

    expect(screen.getByText('Cluster is required to open host nftables.')).toBeInTheDocument()
  })

  it('starts watching and renders nftables text and JSON', async () => {
    mockWatchFetch(
      {
        metadata: { resourceVersion: '42' },
        items: [
          {
            text: 'table inet filter',
            json: { nftables: [{ table: { family: 'inet', name: 'filter' } }] },
          },
        ],
      },
      [],
    )

    await renderPage('cluster-a')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/nft',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/nft?watch=true',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })

    expect(await screen.findByText('TABLE')).toBeInTheDocument()
    expect(screen.getByText('inet')).toBeInTheDocument()
    expect(screen.getByText('filter')).toBeInTheDocument()
    expect(screen.getByText(/rv 42/)).toBeInTheDocument()
  })

  it('renders array-shaped nftables JSON as structured rows', async () => {
    mockWatchFetch(
      {
        items: [
          {
            text: 'table ip raw',
            json: [
              { table: { family: 'ip', name: 'raw' } },
              { chain: { family: 'ip', table: 'nat', name: 'KUBE-SVC-123', handle: 174 } },
            ],
          },
        ],
      },
      [],
    )

    await renderPage('cluster-a')

    expect(await screen.findByText('TABLE')).toBeInTheDocument()
    expect(screen.getByText('CHAIN')).toBeInTheDocument()
    expect(screen.getAllByText('ip')).toHaveLength(2)
    expect(screen.getByText('raw')).toBeInTheDocument()
    expect(screen.getByText('nat')).toBeInTheDocument()
    expect(screen.getByText('KUBE-SVC-123')).toBeInTheDocument()
    expect(screen.queryByText('TEXT')).not.toBeInTheDocument()
  })

  it('renders Kubernetes-style watch events that wrap the NftList in object', async () => {
    mockWatchFetch({ items: [] }, [
      {
        object: {
          metadata: { resourceVersion: '55' },
          items: [{ text: 'chain input' }],
        },
        type: 'MODIFIED',
      },
    ])

    await renderPage('cluster-a')

    expect(await screen.findByText('chain input')).toBeInTheDocument()
    expect(screen.getByText(/rv 55/)).toBeInTheDocument()
  })

  it('can run a snapshot-only request', async () => {
    mockWatchFetch({ items: [{ text: 'initial ruleset' }] }, [])

    await renderPage('cluster-a')

    expect(await screen.findByText('initial ruleset')).toBeInTheDocument()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ items: [{ text: 'snapshot ruleset' }] }),
      ok: true,
    })

    fireEvent.click(screen.getByRole('switch'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText('snapshot ruleset')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/nft',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('clears stale rows when a new request returns no items', async () => {
    mockWatchFetch({ items: [{ text: 'old ruleset' }] }, [])

    await renderPage('cluster-a')

    expect(await screen.findByText('old ruleset')).toBeInTheDocument()

    appendWatchFetch({ items: [] }, [])
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.queryByText('old ruleset')).not.toBeInTheDocument()
    })
  })
})
