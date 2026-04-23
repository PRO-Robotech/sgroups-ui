/* eslint-disable @typescript-eslint/no-explicit-any */
const mockCreateNewEntry = jest.fn()
const mockDeleteEntry = jest.fn()
const mockPatchEntryWithDeleteOp = jest.fn()
const mockPatchEntryWithReplaceOp = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    createNewEntry: (...args: unknown[]) => mockCreateNewEntry(...args),
    deleteEntry: (...args: unknown[]) => mockDeleteEntry(...args),
    patchEntryWithDeleteOp: (...args: unknown[]) => mockPatchEntryWithDeleteOp(...args),
    patchEntryWithReplaceOp: (...args: unknown[]) => mockPatchEntryWithReplaceOp(...args),
  }),
  { virtual: true },
)

jest.mock('components/organisms/AddressGroups/molecules/VerboseAddressGroupPanel/contentsTree', () => ({
  buildAddressGroupContentsTree: jest.fn(() => [{ key: 'contents' }]),
}))

// eslint-disable-next-line import/first
import { buildCurrentBindings, buildOverviewTreeData, patchEditableSpec, syncAddressGroupBindings } from './utils'

describe('ServiceFormModal utils', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockDeleteEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  it('filters current bindings to the selected service', () => {
    const bindings = buildCurrentBindings(
      { metadata: { name: 'svc-a', namespace: 'tenant-a' } } as any,
      [
        { spec: { service: { name: 'svc-a', namespace: 'tenant-a' } } },
        { spec: { service: { name: 'svc-a', namespace: 'tenant-b' } } },
      ] as any,
    )

    expect(bindings).toHaveLength(1)
  })

  it('patches changed editable fields and normalized transports', async () => {
    const patchedCount = await patchEditableSpec(
      '/services/svc-a',
      {
        spec: {
          displayName: 'Current',
          description: 'same',
          comment: 'remove',
          transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '80' }] }],
        },
      } as any,
      {
        displayName: ' Next ',
        description: ' same ',
        comment: ' ',
        transportEntries: [
          { protocol: 'TCP', IPv: 'IPv4', ports: '443', description: ' https ' },
          { protocol: 'ICMP', IPv: 'IPv4', types: ['8', 'bad', ' 0 '], comment: ' ping ' },
        ],
      } as any,
    )

    expect(patchedCount).toBe(3)
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/services/svc-a',
      pathToValue: '/spec/displayName',
      body: 'Next',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/services/svc-a',
      pathToValue: '/spec/comment',
    })
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/services/svc-a',
      pathToValue: '/spec/transports',
      body: [
        { protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '443', description: 'https' }] },
        { protocol: 'ICMP', IPv: 'IPv4', entries: [{ types: [8, 0], comment: 'ping' }] },
      ],
    })
  })

  it('deletes transports when form entries normalize to empty', async () => {
    const patchedCount = await patchEditableSpec(
      '/services/svc-a',
      { spec: { transports: [{ protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '80' }] }] } } as any,
      { transportEntries: [{ protocol: 'TCP', ports: '443' }] } as any,
    )

    expect(patchedCount).toBe(1)
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/services/svc-a',
      pathToValue: '/spec/transports',
    })
  })

  it('creates service bindings in the service namespace and deletes removed bindings', async () => {
    const requestCount = await syncAddressGroupBindings(
      'cluster-a',
      { name: 'svc-a', namespace: 'tenant-service' },
      {
        namespace: 'tenant-service',
        name: 'svc-a',
        addressGroups: ['tenant-ag/ag-new', 'tenant-ag/ag-existing'],
        description: 'desc',
        comment: 'comment',
      } as any,
      [
        {
          metadata: { name: 'existing-binding', namespace: 'tenant-service' },
          spec: { addressGroup: { name: 'ag-existing', namespace: 'tenant-ag' } },
        },
        {
          metadata: { name: 'old-binding', namespace: 'tenant-service' },
          spec: { addressGroup: { name: 'ag-old', namespace: 'tenant-ag' } },
        },
      ] as any,
    )

    expect(requestCount).toBe(2)
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-service/servicebindings',
        body: expect.objectContaining({
          kind: 'ServiceBinding',
          metadata: expect.objectContaining({ namespace: 'tenant-service' }),
          spec: expect.objectContaining({
            addressGroup: { namespace: 'tenant-ag', name: 'ag-new' },
            service: { name: 'svc-a', namespace: 'tenant-service' },
          }),
        }),
      }),
    )
    expect(mockDeleteEntry).toHaveBeenCalledWith({
      endpoint:
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-service/servicebindings/old-binding',
    })
  })

  it('builds overview nodes for selected address groups', () => {
    const treeData = buildOverviewTreeData({
      addressGroups: [{ metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Group A' } }] as any,
      selectedAddressGroupValues: ['tenant-a/ag-a'],
      serviceBindings: [{ spec: { addressGroup: { name: 'ag-a', namespace: 'tenant-a' } } }] as any,
    })

    expect(treeData).toHaveLength(1)
    expect(treeData[0]).toEqual(expect.objectContaining({ key: 'overview-tenant-a/ag-a' }))
    expect(treeData[0].children).toEqual([{ key: 'contents' }])
  })
})
