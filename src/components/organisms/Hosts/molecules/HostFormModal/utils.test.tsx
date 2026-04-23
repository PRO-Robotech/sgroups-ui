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

describe('HostFormModal utils', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockDeleteEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  it('filters current bindings to the selected host', () => {
    const bindings = buildCurrentBindings(
      { metadata: { name: 'host-a', namespace: 'tenant-a' } } as any,
      [
        { spec: { host: { name: 'host-a', namespace: 'tenant-a' } } },
        { spec: { host: { name: 'host-a', namespace: 'tenant-b' } } },
        { spec: { host: { name: 'host-b', namespace: 'tenant-a' } } },
      ] as any,
    )

    expect(bindings).toHaveLength(1)
  })

  it('patches only changed editable fields', async () => {
    const patchedCount = await patchEditableSpec(
      '/hosts/host-a',
      { spec: { displayName: 'Current', description: 'keep', comment: 'remove' } } as any,
      { displayName: ' Next ', description: ' keep ', comment: ' ' } as any,
    )

    expect(patchedCount).toBe(2)
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/hosts/host-a',
      pathToValue: '/spec/displayName',
      body: 'Next',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/hosts/host-a',
      pathToValue: '/spec/comment',
    })
  })

  it('does not patch unchanged values', async () => {
    const patchedCount = await patchEditableSpec(
      '/hosts/host-a',
      { spec: { displayName: 'Current', description: 'desc', comment: 'comment' } } as any,
      { displayName: ' Current ', description: ' desc ', comment: ' comment ' } as any,
    )

    expect(patchedCount).toBe(0)
    expect(mockPatchEntryWithReplaceOp).not.toHaveBeenCalled()
    expect(mockPatchEntryWithDeleteOp).not.toHaveBeenCalled()
  })

  it('creates host bindings in the host namespace and deletes removed bindings', async () => {
    const requestCount = await syncAddressGroupBindings(
      'cluster-a',
      { name: 'host-a', namespace: 'tenant-host' },
      {
        namespace: 'tenant-host',
        name: 'host-a',
        addressGroups: ['tenant-ag/ag-new', 'tenant-ag/ag-existing'],
        description: 'desc',
        comment: 'comment',
      } as any,
      [
        {
          metadata: { name: 'existing-binding', namespace: 'tenant-host' },
          spec: { addressGroup: { name: 'ag-existing', namespace: 'tenant-ag' } },
        },
        {
          metadata: { name: 'old-binding', namespace: 'tenant-host' },
          spec: { addressGroup: { name: 'ag-old', namespace: 'tenant-ag' } },
        },
      ] as any,
    )

    expect(requestCount).toBe(2)
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-host/hostbindings',
        body: expect.objectContaining({
          kind: 'HostBinding',
          metadata: expect.objectContaining({ namespace: 'tenant-host' }),
          spec: expect.objectContaining({
            addressGroup: { namespace: 'tenant-ag', name: 'ag-new' },
            host: { name: 'host-a', namespace: 'tenant-host' },
          }),
        }),
      }),
    )
    expect(mockDeleteEntry).toHaveBeenCalledWith({
      endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-host/hostbindings/old-binding',
    })
  })

  it('builds overview nodes for selected address groups', () => {
    const treeData = buildOverviewTreeData({
      addressGroups: [{ metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Group A' } }] as any,
      selectedAddressGroupValues: ['tenant-a/ag-a'],
      hostBindings: [{ spec: { addressGroup: { name: 'ag-a', namespace: 'tenant-a' } } }] as any,
    })

    expect(treeData).toHaveLength(1)
    expect(treeData[0]).toEqual(expect.objectContaining({ key: 'overview-tenant-a/ag-a' }))
    expect(treeData[0].children).toEqual([{ key: 'contents' }])
  })
})
