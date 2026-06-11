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
import React from 'react'
// eslint-disable-next-line import/first
import { render, screen } from '@testing-library/react'
// eslint-disable-next-line import/first
import {
  buildEndpointPayload,
  buildFormValuesFromRule,
  buildOverviewTreeData,
  buildTransportPayload,
  getTrafficOptionsForEndpoints,
  normalizeRuleTrafficForEndpoints,
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
          session: { traffic: 'Ingress' },
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
        traffic: 'Ingress',
        local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a', value: undefined },
        remote: { type: 'CIDR', namespace: undefined, name: undefined, value: '10.0.0.0/24' },
        transportIPv: 'IPv4',
        transportProtocol: 'TCP',
        transportEntries: [{ ports: '80', types: ['8'], description: 'desc', comment: 'comment' }],
      }),
    )
  })

  it('normalizes backend traffic casing for the select value', () => {
    expect(
      buildFormValuesFromRule({
        metadata: { namespace: 'tenant-a', name: 'rule-a' },
        spec: {
          session: { traffic: 'Ingress' },
        },
      } as any).traffic,
    ).toBe('Ingress')
  })

  it('limits AddressGroup to FQDN rule traffic to egress', () => {
    const values = {
      local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
      remote: { type: 'FQDN', value: 'api.example.com' },
      traffic: 'Both',
    } as any

    expect(getTrafficOptionsForEndpoints(values)).toEqual([{ label: 'Egress', value: 'Egress' }])
    expect(normalizeRuleTrafficForEndpoints(values)).toBe('Egress')
  })

  it('limits Service to FQDN rule traffic to egress', () => {
    const values = {
      local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
      remote: { type: 'FQDN', value: 'api.example.com' },
      traffic: 'Ingress',
    } as any

    expect(getTrafficOptionsForEndpoints(values)).toEqual([{ label: 'Egress', value: 'Egress' }])
    expect(normalizeRuleTrafficForEndpoints(values)).toBe('Egress')
  })

  it('limits AddressGroup to CIDR rule traffic to ingress or egress', () => {
    const values = {
      local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
      remote: { type: 'CIDR', value: '10.0.0.0/24' },
      traffic: 'Both',
    } as any

    expect(getTrafficOptionsForEndpoints(values).map(option => option.value)).toEqual(['Ingress', 'Egress'])
    expect(normalizeRuleTrafficForEndpoints(values)).toBe('Egress')
  })

  it('limits Service to CIDR rule traffic to ingress or egress', () => {
    const values = {
      local: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
      remote: { type: 'CIDR', value: '10.0.0.0/24' },
      traffic: 'Ingress',
    } as any

    expect(getTrafficOptionsForEndpoints(values).map(option => option.value)).toEqual(['Ingress', 'Egress'])
    expect(normalizeRuleTrafficForEndpoints(values)).toBe('Ingress')
  })

  it('keeps normal traffic options for non-literal remote endpoint rules', () => {
    expect(
      getTrafficOptionsForEndpoints({
        local: { type: 'AddressGroup', namespace: 'tenant-a', name: 'ag-a' },
        remote: { type: 'Service', namespace: 'tenant-a', name: 'svc-a' },
      } as any).map(option => option.value),
    ).toEqual(['Both', 'Ingress', 'Egress'])
  })

  it('builds overview nodes for local and remote trees', () => {
    expect(
      buildOverviewTreeData({
        localTreeData: [{ key: 'local-a' }],
        remoteTreeData: [{ key: 'remote-a' }, { key: 'remote-b' }],
      }),
    ).toEqual([
      expect.objectContaining({ key: 'overview-local', children: [{ key: 'overview-local-local-a' }] }),
      expect.objectContaining({
        key: 'overview-remote',
        children: [{ key: 'overview-remote-remote-a' }, { key: 'overview-remote-remote-b' }],
      }),
    ])
  })

  it('does not count empty placeholder leaves as configured overview roots', () => {
    const tree = buildOverviewTreeData({
      localTreeData: [{ title: 'No endpoint configured', key: 'endpoint-empty', isLeaf: true }],
      remoteTreeData: [
        { title: 'No endpoint configured', key: 'endpoint-empty', isLeaf: true },
        { title: 'Remote endpoint', key: 'remote-a' },
      ],
    })

    render(
      <>
        {tree[0].title}
        {tree[1].title}
      </>,
    )

    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders changed overview and endpoint roots with Changed markers', () => {
    const tree = buildOverviewTreeData({
      localTreeData: [{ key: 'local-a', title: 'Local endpoint' }],
      remoteTreeData: [],
      isLocalChanged: true,
    })

    render(
      <>
        {tree[0].title}
        {tree[0].children?.[0].title}
      </>,
    )

    expect(screen.getAllByText('Changed')).toHaveLength(2)
    expect(screen.getByText('Local endpoint')).toBeInTheDocument()
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
          session: { traffic: 'Both' },
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
    expect(mockPatchEntryWithReplaceOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/session',
      body: { traffic: 'Egress' },
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/description',
    })
    expect(mockPatchEntryWithDeleteOp).toHaveBeenCalledWith({
      endpoint: '/rules/rule-a',
      pathToValue: '/spec/transport',
    })
  })
})
