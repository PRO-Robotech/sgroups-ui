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

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ defaultLanguage, value }: { defaultLanguage?: string; value?: string }) => (
    <textarea aria-label="Plain response" data-language={defaultLanguage} readOnly value={value || ''} />
  ),
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

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(promiseResolve => {
    resolve = promiseResolve
  })

  return { promise, resolve }
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

    expect(await screen.findByDisplayValue('table inet filter')).toBeInTheDocument()
    expect(screen.getByLabelText('Plain response')).toHaveAttribute('data-language', 'nftables')
    expect(document.querySelector('.ant-table')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Structure'))

    await waitFor(() => {
      expect(screen.getAllByText('TABLE').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('inet').length).toBeGreaterThan(0)
    expect(screen.getAllByText('filter').length).toBeGreaterThan(0)
    expect(screen.queryByText('Raw object JSON')).not.toBeInTheDocument()
    expect(screen.getByText(/rv 42/)).toBeInTheDocument()
    expect(screen.queryByText('Ruleset 0')).not.toBeInTheDocument()
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
              {
                rule: {
                  family: 'ip',
                  table: 'nat',
                  chain: 'KUBE-SVC-123',
                  handle: 175,
                  expr: [
                    { payload: { protocol: 'ip', field: 'saddr' } },
                    { cmp: { op: '==', data: '10.0.0.1' } },
                    { accept: null },
                  ],
                },
              },
              {
                rule: {
                  family: 'ip',
                  table: 'nat',
                  chain: 'KUBE-SVC-123',
                  handle: 176,
                  exprs: [
                    { match: { left: { payload: { protocol: 'tcp', field: 'dport' } }, op: '==', right: 443 } },
                    { xt: { name: 'comment' } },
                    { counter: { packets: 10, bytes: 2048 } },
                    { jump: { target: 'SGROUPS-ALLOW' } },
                  ],
                },
              },
            ],
          },
        ],
      },
      [],
    )

    const { container } = await renderPage('cluster-a')

    fireEvent.click(screen.getByText('Structure'))
    expect(screen.getByRole('tab', { name: 'Structure' })).toHaveAttribute('aria-selected', 'true')
    expect(container.querySelector('.ant-table')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getAllByText('TABLE').length).toBeGreaterThan(0)
    })
    expect(screen.getByText('CHAIN')).toBeInTheDocument()
    expect(screen.getAllByText('ip').length).toBeGreaterThan(0)
    expect(screen.getAllByText('raw').length).toBeGreaterThan(0)
    expect(screen.getAllByText('nat').length).toBeGreaterThan(0)
    expect(screen.getAllByText('KUBE-SVC-123').length).toBeGreaterThan(0)
    expect(screen.getAllByText('RULE').length).toBeGreaterThan(0)
    expect(screen.getByText('ip.saddr == 10.0.0.1')).toBeInTheDocument()
    expect(screen.getByText('accept')).toBeInTheDocument()
    expect(screen.getByText('tcp.dport == 443')).toBeInTheDocument()
    expect(screen.getByText('Match extension: comment')).toBeInTheDocument()
    expect(screen.getByText('Count traffic: 10 packets, 2048 bytes')).toBeInTheDocument()
    expect(screen.getByText('Jump to SGROUPS-ALLOW')).toBeInTheDocument()
    expect(screen.queryByText('exprs')).not.toBeInTheDocument()
    expect(screen.queryByText('Handle')).not.toBeInTheDocument()
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

    expect(await screen.findByDisplayValue('chain input')).toBeInTheDocument()
    expect(screen.getByText(/rv 55/)).toBeInTheDocument()
  })

  it('can run a snapshot-only request', async () => {
    mockWatchFetch({ items: [{ text: 'initial ruleset' }] }, [])

    await renderPage('cluster-a')

    expect(await screen.findByDisplayValue('initial ruleset')).toBeInTheDocument()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ items: [{ text: 'snapshot ruleset' }] }),
      ok: true,
    })

    fireEvent.click(screen.getByRole('switch'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByDisplayValue('snapshot ruleset')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hosts/host-a/nft',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('clears stale rows when a new request returns no items', async () => {
    mockWatchFetch({ items: [{ text: 'old ruleset' }] }, [])

    await renderPage('cluster-a')

    expect(await screen.findByDisplayValue('old ruleset')).toBeInTheDocument()

    appendWatchFetch({ items: [] }, [])
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.queryByDisplayValue('old ruleset')).not.toBeInTheDocument()
    })
  })

  it('shows a standalone spinner until an empty response is resolved', async () => {
    const snapshotRequest = createDeferred<Response>()
    const watchRequest = createDeferred<Response>()
    ;(global.fetch as jest.Mock).mockReturnValueOnce(snapshotRequest.promise).mockReturnValueOnce(watchRequest.promise)

    const { container } = await renderPage('cluster-a')

    await waitFor(() => {
      expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument()
    })
    expect(container.querySelector('.ant-table')).not.toBeInTheDocument()

    await act(async () => {
      snapshotRequest.resolve({
        json: async () => ({ items: [] }),
        ok: true,
      } as Response)
    })

    await waitFor(() => {
      expect(container.querySelector('.ant-spin-spinning')).not.toBeInTheDocument()
    })
    expect(screen.getByLabelText('Plain response')).toBeInTheDocument()
    expect(container.querySelector('.ant-table')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Structure'))

    await waitFor(() => {
      expect(container.querySelector('.ant-spin-spinning')).not.toBeInTheDocument()
      expect(screen.getByText('No nftables structure found.')).toBeInTheDocument()
    })
    expect(container.querySelector('.ant-table')).not.toBeInTheDocument()
  })

  it('keeps rule rows self-describing when virtual scrolling into rules', async () => {
    mockWatchFetch(
      {
        items: [
          {
            text: 'table ip nat',
            json: {
              nftables: [
                { table: { family: 'ip', name: 'nat' } },
                { chain: { family: 'ip', table: 'nat', name: 'CHAIN-A' } },
                ...Array.from({ length: 80 }, (_, index) => ({
                  rule: {
                    family: 'ip',
                    table: 'nat',
                    chain: 'CHAIN-A',
                    expr: [{ accept: null }],
                    handle: index,
                  },
                })),
              ],
            },
          },
        ],
      },
      [],
    )

    await renderPage('cluster-a')

    fireEvent.click(screen.getByText('Structure'))
    await waitFor(() => {
      expect(screen.getAllByText('RULE').length).toBeGreaterThan(0)
    })

    const scroller = screen.getByTestId('nft-structure-virtual-scroll')
    fireEvent.scroll(scroller, { target: { scrollTop: 1800 } })

    expect(screen.getAllByText('RULE').length).toBeGreaterThan(0)
    expect(screen.getAllByText('CHAIN-A').length).toBeGreaterThan(0)
  })
})
