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

describe('NetworkFormModal utils', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockDeleteEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  it('filters current bindings to the selected network', () => {
    const bindings = buildCurrentBindings(
      { metadata: { name: 'net-a', namespace: 'tenant-a' } } as any,
      [
        { spec: { network: { name: 'net-a', namespace: 'tenant-a' } } },
        { spec: { network: { name: 'net-a', namespace: 'tenant-b' } } },
      ] as any,
    )

    expect(bindings).toHaveLength(1)
  })

  it('patches changed CIDR and editable optional fields', async () => {
    const patchedCount = await patchEditableSpec(
      '/networks/net-a',
      { spec: { CIDR: '10.0.0.0/24', displayName: 'Current', description: 'remove', comment: 'same' } } as any,
      { cidr: '10.0.1.0/24', displayName: ' Next ', description: ' ', comment: ' same ' } as any,
    )

    expect(patchedCount).toBe(3)
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/networks/net-a',
      pathToValue: '/spec/CIDR',
      body: '10.0.1.0/24',
    })
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/networks/net-a',
      pathToValue: '/spec/displayName',
      body: 'Next',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/networks/net-a',
      pathToValue: '/spec/description',
    })
  })

  it('does not patch unchanged network values', async () => {
    const patchedCount = await patchEditableSpec(
      '/networks/net-a',
      { spec: { CIDR: '10.0.0.0/24', displayName: 'Current', description: 'desc', comment: 'comment' } } as any,
      { cidr: '10.0.0.0/24', displayName: ' Current ', description: ' desc ', comment: ' comment ' } as any,
    )

    expect(patchedCount).toBe(0)
    expect(mockPatchEntryWithReplaceOp).not.toHaveBeenCalled()
    expect(mockPatchEntryWithDeleteOp).not.toHaveBeenCalled()
  })

  it('creates network bindings in the network namespace and deletes removed bindings', async () => {
    const requestCount = await syncAddressGroupBindings(
      'cluster-a',
      { name: 'net-a', namespace: 'tenant-network' },
      {
        namespace: 'tenant-network',
        name: 'net-a',
        addressGroups: ['tenant-ag/ag-new', 'tenant-ag/ag-existing'],
        description: 'desc',
        comment: 'comment',
      } as any,
      [
        {
          metadata: { name: 'existing-binding', namespace: 'tenant-network' },
          spec: { addressGroup: { name: 'ag-existing', namespace: 'tenant-ag' } },
        },
        {
          metadata: { name: 'old-binding', namespace: 'tenant-network' },
          spec: { addressGroup: { name: 'ag-old', namespace: 'tenant-ag' } },
        },
      ] as any,
    )

    expect(requestCount).toBe(2)
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-network/networkbindings',
        body: expect.objectContaining({
          kind: 'NetworkBinding',
          metadata: expect.objectContaining({ namespace: 'tenant-network' }),
          spec: expect.objectContaining({
            addressGroup: { namespace: 'tenant-ag', name: 'ag-new' },
            network: { name: 'net-a', namespace: 'tenant-network' },
          }),
        }),
      }),
    )
    expect(mockDeleteEntry).toHaveBeenCalledWith({
      endpoint:
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-network/networkbindings/old-binding',
    })
  })

  it('builds overview nodes for selected address groups', () => {
    const treeData = buildOverviewTreeData({
      addressGroups: [{ metadata: { name: 'ag-a', namespace: 'tenant-a' }, spec: { displayName: 'Group A' } }] as any,
      selectedAddressGroupValues: ['tenant-a/ag-a'],
      networkBindings: [{ spec: { addressGroup: { name: 'ag-a', namespace: 'tenant-a' } } }] as any,
    })

    expect(treeData).toHaveLength(1)
    expect(treeData[0]).toEqual(expect.objectContaining({ key: 'overview-tenant-a/ag-a' }))
    expect(treeData[0].children).toEqual([{ key: 'contents' }])
  })
})
