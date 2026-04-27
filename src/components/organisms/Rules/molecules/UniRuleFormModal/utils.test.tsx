/* eslint-disable @typescript-eslint/no-explicit-any */
const mockPatchEntryWithDeleteOp = jest.fn()
const mockPatchEntryWithReplaceOp = jest.fn()

jest.mock(
  '@prorobotech/openapi-k8s-toolkit',
  () => ({
    patchEntryWithDeleteOp: (...args: unknown[]) => mockPatchEntryWithDeleteOp(...args),
    patchEntryWithReplaceOp: (...args: unknown[]) => mockPatchEntryWithReplaceOp(...args),
  }),
  { virtual: true },
)

// eslint-disable-next-line import/first
import {
  buildEndpointPayload,
  buildFormValuesFromRule,
  buildOverviewTreeData,
  buildTransportPayload,
  patchRuleSpec,
} from './utils'

describe('UniRuleFormModal utils', () => {
  beforeEach(() => {
    mockPatchEntryWithDeleteOp.mockResolvedValue(undefined)
    mockPatchEntryWithReplaceOp.mockResolvedValue(undefined)
    jest.clearAllMocks()
  })

  it('builds endpoint payloads for refs and literal endpoints', () => {
    expect(buildEndpointPayload({ type: 'AddressGroup', namespace: ' tenant-a ', name: ' ag-a ' } as any)).toEqual({
      type: 'AddressGroup',
      namespace: 'tenant-a',
      name: 'ag-a',
    })
    expect(buildEndpointPayload({ type: 'FQDN', value: ' api.example.com ' } as any)).toEqual({
      type: 'FQDN',
      value: 'api.example.com',
    })
    expect(buildEndpointPayload({ type: 'Service', namespace: 'tenant-a', name: ' ' } as any)).toBeUndefined()
  })

  it('builds transport payload only when protocol, IP version, and entries are present', () => {
    expect(
      buildTransportPayload({
        transportProtocol: 'TCP',
        transportIPv: 'IPv4',
        transportEntries: [
          { ports: ' 80, 443 ', description: ' web ' },
          { types: ['8', '256', '-1', 'bad'], comment: ' icmp ' },
          { ports: ' ', comment: ' ' },
        ],
      } as any),
    ).toEqual({
      protocol: 'TCP',
      IPv: 'IPv4',
      entries: [
        { ports: '80, 443', types: undefined, description: 'web', comment: undefined },
        { ports: undefined, types: [8], description: undefined, comment: 'icmp' },
      ],
    })

    expect(
      buildTransportPayload({ transportProtocol: 'TCP', transportEntries: [{ ports: '80' }] } as any),
    ).toBeUndefined()
  })

  it('builds form values from an existing rule', () => {
    expect(
      buildFormValuesFromRule({
        metadata: { namespace: 'tenant-a', name: 'rule-a' },
        spec: {
          displayName: 'Rule A',
          action: 'Deny',
          session: { traffic: 'ingress' },
          endpoints: {
            local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
            remote: { type: 'CIDR', value: '10.0.0.0/24' },
          },
          transport: {
            IPv: 'IPv4',
            protocol: 'TCP',
            entries: [{ ports: '80', types: [8], description: 'desc', comment: 'comment' }],
          },
        },
      } as any),
    ).toEqual(
      expect.objectContaining({
        namespace: 'tenant-a',
        name: 'rule-a',
        displayName: 'Rule A',
        action: 'Deny',
        traffic: 'ingress',
        local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a', value: undefined },
        remote: { type: 'CIDR', namespace: undefined, name: undefined, value: '10.0.0.0/24' },
        transportIPv: 'IPv4',
        transportProtocol: 'TCP',
        transportEntries: [{ ports: '80', types: ['8'], description: 'desc', comment: 'comment' }],
      }),
    )
  })

  it('builds overview nodes for local and remote trees', () => {
    expect(
      buildOverviewTreeData({
        localTreeData: [{ key: 'local-a' }],
        remoteTreeData: [{ key: 'remote-a' }, { key: 'remote-b' }],
      }),
    ).toEqual([
      expect.objectContaining({ key: 'overview-local', children: [{ key: 'local-a' }] }),
      expect.objectContaining({ key: 'overview-remote', children: [{ key: 'remote-a' }, { key: 'remote-b' }] }),
    ])
  })

  it('patches only changed rule fields and deletes cleared nested values', async () => {
    const patchedCount = await patchRuleSpec(
      '/rules/rule-a',
      {
        metadata: { namespace: 'tenant-a', name: 'rule-a' },
        spec: {
          displayName: 'Current',
          action: 'Allow',
          description: 'remove',
          comment: 'same',
          session: { traffic: 'both' },
          endpoints: {
            local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
            remote: { type: 'FQDN', value: 'old.example.com' },
          },
          transport: { protocol: 'TCP', IPv: 'IPv4', entries: [{ ports: '80' }] },
        },
      } as any,
      {
        displayName: ' Next ',
        action: 'Deny',
        description: ' ',
        comment: ' same ',
        local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
        remote: { type: 'FQDN', value: 'new.example.com' },
        traffic: undefined,
        transportProtocol: undefined,
        transportIPv: undefined,
        transportEntries: [],
      } as any,
    )

    expect(patchedCount).toBe(6)
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/displayName',
      body: 'Next',
    })
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/action',
      body: 'Deny',
    })
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/endpoints/remote',
      body: { type: 'FQDN', value: 'new.example.com' },
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/description',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/session',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/transport',
    })
  })
})
