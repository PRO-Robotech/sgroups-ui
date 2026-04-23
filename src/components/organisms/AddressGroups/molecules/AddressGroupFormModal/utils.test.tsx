/* eslint-disable import/first */
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

import {
  buildCurrentBindings,
  getNamespacedResourceOptions,
  getResourceOptions,
  parseNamespacedValue,
  patchEditableSpec,
  syncBindings,
} from './utils'

describe('AddressGroupFormModal utils', () => {
  beforeEach(() => {
    mockCreateNewEntry.mockResolvedValue(undefined)
    mockDeleteEntry.mockResolvedValue(undefined)
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  it('builds sorted resource options and skips items without names', () => {
    const options = getResourceOptions('Host', [
      { metadata: { name: 'z-host' } },
      { metadata: {} },
      { metadata: { name: 'a-host' } },
    ] as any)

    expect(options.map(option => option.value)).toEqual(['a-host', 'z-host'])
    expect(options.map(option => option.searchText)).toEqual(['a-host', 'z-host'])
  })

  it('builds namespaced service options with namespace/name values', () => {
    const options = getNamespacedResourceOptions([
      { metadata: { name: 'svc-b', namespace: 'tenant-b' } },
      { metadata: { name: 'svc-a', namespace: 'tenant-a' } },
      { metadata: { name: 'missing-namespace' } },
    ] as any)

    expect(options.map(option => option.value)).toEqual(['tenant-a/svc-a', 'tenant-b/svc-b'])
    expect(options.map(option => option.searchText)).toEqual(['tenant-a svc-a', 'tenant-b svc-b'])
  })

  it('parses namespaced values without losing slash-containing names', () => {
    expect(parseNamespacedValue('tenant-a/service/path')).toEqual({
      namespace: 'tenant-a',
      name: 'service/path',
    })
  })

  it('filters current bindings to the selected address group', () => {
    const bindings = buildCurrentBindings(
      { metadata: { name: 'ag-a', namespace: 'tenant-a' } } as any,
      [
        { spec: { addressGroup: { name: 'ag-a', namespace: 'tenant-a' } } },
        { spec: { addressGroup: { name: 'ag-b', namespace: 'tenant-a' } } },
      ] as any,
      [{ spec: { addressGroup: { name: 'ag-a', namespace: 'tenant-a' } } }] as any,
      [{ spec: { addressGroup: { name: 'ag-a', namespace: 'tenant-b' } } }] as any,
    )

    expect(bindings.hosts).toHaveLength(1)
    expect(bindings.services).toHaveLength(1)
    expect(bindings.networks).toHaveLength(0)
  })

  it('patches only changed editable fields and deletes cleared optional fields', async () => {
    const patchedCount = await patchEditableSpec(
      '/endpoint',
      {
        spec: {
          defaultAction: 'Deny',
          displayName: 'Current',
          description: 'same',
          comment: 'remove me',
        },
      } as any,
      {
        allowAccess: true,
        displayName: ' Next ',
        description: ' same ',
        comment: '   ',
      } as any,
    )

    expect(patchedCount).toBe(3)
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/endpoint',
      pathToValue: '/spec/defaultAction',
      body: 'Allow',
    })
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/endpoint',
      pathToValue: '/spec/displayName',
      body: 'Next',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/endpoint',
      pathToValue: '/spec/comment',
    })
  })

  it('does not patch when editable values are unchanged after normalization', async () => {
    const patchedCount = await patchEditableSpec(
      '/endpoint',
      { spec: { defaultAction: 'Allow', displayName: 'Name', description: 'desc', comment: 'comment' } } as any,
      { allowAccess: true, displayName: ' Name ', description: ' desc ', comment: ' comment ' } as any,
    )

    expect(patchedCount).toBe(0)
    expect(mockPatchEntryWithReplaceOp).not.toHaveBeenCalled()
    expect(mockPatchEntryWithDeleteOp).not.toHaveBeenCalled()
  })

  it('creates and deletes resource bindings in their required namespaces', async () => {
    const requestCount = await syncBindings(
      'cluster-a',
      { name: 'ag-a', namespace: 'tenant-a' },
      {
        namespace: 'tenant-a',
        name: 'ag-a',
        hosts: ['host-new'],
        services: ['tenant-service/svc-new'],
        networks: ['net-existing'],
        description: 'desc',
        comment: 'comment',
      } as any,
      {
        hosts: [
          { metadata: { name: 'old-host-binding', namespace: 'tenant-a' }, spec: { host: { name: 'host-old' } } },
        ],
        services: [
          {
            metadata: { name: 'old-service-binding', namespace: 'tenant-old-service' },
            spec: { service: { name: 'svc-old', namespace: 'tenant-old-service' } },
          },
        ],
        networks: [
          { metadata: { name: 'net-binding', namespace: 'tenant-a' }, spec: { network: { name: 'net-existing' } } },
        ],
      } as any,
    )

    expect(requestCount).toBe(4)
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hostbindings',
        body: expect.objectContaining({ kind: 'HostBinding' }),
      }),
    )
    expect(mockCreateNewEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-service/servicebindings',
        body: expect.objectContaining({
          kind: 'ServiceBinding',
          metadata: expect.objectContaining({ namespace: 'tenant-service' }),
        }),
      }),
    )
    expect(mockDeleteEntry).toHaveBeenCalledWith({
      endpoint:
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-a/hostbindings/old-host-binding',
    })
    expect(mockDeleteEntry).toHaveBeenCalledWith({
      endpoint:
        '/api/clusters/cluster-a/k8s/apis/sgroups.io/v1alpha1/namespaces/tenant-old-service/servicebindings/old-service-binding',
    })
  })

  it('waits for each binding request before starting the next one', async () => {
    let resolveFirstRequest: (() => void) | undefined
    const firstRequest = new Promise<void>(resolve => {
      resolveFirstRequest = resolve
    })

    mockCreateNewEntry.mockImplementationOnce(() => firstRequest).mockImplementationOnce(() => Promise.resolve())

    const syncPromise = syncBindings(
      'cluster-a',
      { name: 'ag-a', namespace: 'tenant-a' },
      {
        namespace: 'tenant-a',
        name: 'ag-a',
        hosts: ['host-a', 'host-b'],
        services: [],
        networks: [],
      } as any,
      {
        hosts: [],
        services: [],
        networks: [],
      } as any,
    )

    await Promise.resolve()

    expect(mockCreateNewEntry).toHaveBeenCalledTimes(1)

    resolveFirstRequest?.()
    await syncPromise

    expect(mockCreateNewEntry).toHaveBeenCalledTimes(2)
  })
})
