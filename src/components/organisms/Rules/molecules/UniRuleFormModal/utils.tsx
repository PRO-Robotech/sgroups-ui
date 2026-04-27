import type { TreeDataNode } from 'antd'
import { patchEntryWithDeleteOp, patchEntryWithReplaceOp } from '@prorobotech/openapi-k8s-toolkit'
import { normalizeOptionalString, normalizeTrafficValue, runSequentialRequests } from 'utils'
import { TRuleEndpoint, TRuleResource } from '../../tableConfig'
import { Styled } from './styled'
import { TEndpointFormValues, TTransportEntryFormValue, TUniRuleFormValues } from './types'

export const ENDPOINT_TYPE_OPTIONS = [
  { label: 'Address Group', value: 'AddressGroup' },
  { label: 'Service', value: 'Service' },
  { label: 'FQDN', value: 'FQDN' },
  { label: 'CIDR', value: 'CIDR' },
] as const

export const LOCAL_ENDPOINT_TYPE_OPTIONS = ENDPOINT_TYPE_OPTIONS.filter(
  option => option.value === 'AddressGroup' || option.value === 'Service',
)

export const ACTION_OPTIONS = [
  { label: 'Allow', value: 'Allow' },
  { label: 'Deny', value: 'Deny' },
] as const

export const TRAFFIC_OPTIONS = [
  { label: 'Both', value: 'both' },
  { label: 'Ingress', value: 'ingress' },
  { label: 'Egress', value: 'egress' },
] as const

export const buildEndpointPayload = (endpoint?: TEndpointFormValues): TRuleEndpoint | undefined => {
  if (!endpoint?.type) {
    return undefined
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    const value = normalizeOptionalString(endpoint.value)

    return value
      ? {
          type: endpoint.type,
          value,
        }
      : undefined
  }

  const name = normalizeOptionalString(endpoint.name)
  const namespace = normalizeOptionalString(endpoint.namespace)

  return name && namespace
    ? {
        type: endpoint.type,
        name,
        namespace,
      }
    : undefined
}

const buildTransportEntries = (entries?: TTransportEntryFormValue[]) =>
  (entries || [])
    .map(entry => {
      const ports = normalizeOptionalString(entry.ports)
      const types = (entry.types || [])
        .map(item => Number(String(item).trim()))
        .filter(item => Number.isInteger(item) && item >= 0 && item <= 255)

      return {
        ports,
        types: types.length > 0 ? types : undefined,
        description: normalizeOptionalString(entry.description),
        comment: normalizeOptionalString(entry.comment),
      }
    })
    .filter(entry => entry.ports || (entry.types && entry.types.length > 0) || entry.description || entry.comment)

export const buildTransportPayload = (values: TUniRuleFormValues) => {
  const entries = buildTransportEntries(values.transportEntries)

  if (!values.transportProtocol || !values.transportIPv || entries.length === 0) {
    return undefined
  }

  return {
    protocol: values.transportProtocol,
    IPv: values.transportIPv,
    entries,
  }
}

export const buildFormValuesFromRule = (rule?: TRuleResource | null): Partial<TUniRuleFormValues> => ({
  namespace: rule?.metadata.namespace,
  name: rule?.metadata.name,
  displayName: rule?.spec?.displayName,
  action: rule?.spec?.action || 'Allow',
  traffic: normalizeTrafficValue(rule?.spec?.session?.traffic),
  description: rule?.spec?.description,
  comment: rule?.spec?.comment,
  local: {
    type: rule?.spec?.endpoints?.local?.type,
    namespace: rule?.spec?.endpoints?.local?.namespace,
    name: rule?.spec?.endpoints?.local?.name,
    value: rule?.spec?.endpoints?.local?.value,
  },
  remote: {
    type: rule?.spec?.endpoints?.remote?.type,
    namespace: rule?.spec?.endpoints?.remote?.namespace,
    name: rule?.spec?.endpoints?.remote?.name,
    value: rule?.spec?.endpoints?.remote?.value,
  },
  transportIPv: rule?.spec?.transport?.IPv,
  transportProtocol: rule?.spec?.transport?.protocol,
  transportEntries:
    rule?.spec?.transport?.entries?.map(entry => ({
      ports: entry.ports,
      types: entry.types?.map(item => String(item)),
      description: entry.description,
      comment: entry.comment,
    })) || [],
})

const renderOverviewTitle = (label: 'Local' | 'Remote', count: number) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span>{label}</span>
    <Styled.Count>{count}</Styled.Count>
  </span>
)

export const buildOverviewTreeData = ({
  localTreeData,
  remoteTreeData,
}: {
  localTreeData: TreeDataNode[]
  remoteTreeData: TreeDataNode[]
}): TreeDataNode[] => [
  {
    title: renderOverviewTitle('Local', localTreeData.length),
    key: 'overview-local',
    children: localTreeData,
  },
  {
    title: renderOverviewTitle('Remote', remoteTreeData.length),
    key: 'overview-remote',
    children: remoteTreeData,
  },
]

export const patchRuleSpec = async (endpoint: string, currentRule: TRuleResource, values: TUniRuleFormValues) => {
  const patchRequests: Array<() => Promise<unknown>> = []
  const normalizedCurrent = buildFormValuesFromRule(currentRule)
  const nextLocal = buildEndpointPayload(values.local)
  const nextRemote = buildEndpointPayload(values.remote)
  const nextTransport = buildTransportPayload(values)
  const nextTraffic = normalizeTrafficValue(values.traffic)
  const currentTraffic = normalizeTrafficValue(currentRule.spec?.session?.traffic)

  ;(
    [
      [
        'displayName',
        normalizeOptionalString(values.displayName),
        normalizeOptionalString(currentRule.spec?.displayName),
      ],
      [
        'description',
        normalizeOptionalString(values.description),
        normalizeOptionalString(currentRule.spec?.description),
      ],
      ['comment', normalizeOptionalString(values.comment), normalizeOptionalString(currentRule.spec?.comment)],
    ] as const
  ).forEach(([fieldName, nextValue, currentValue]) => {
    if (nextValue === currentValue) {
      return
    }

    if (nextValue === undefined) {
      patchRequests.push(() =>
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: `/spec/${fieldName}`,
        }),
      )

      return
    }

    patchRequests.push(() =>
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: `/spec/${fieldName}`,
        body: nextValue,
      }),
    )
  })

  if (values.action !== currentRule.spec?.action) {
    patchRequests.push(() =>
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/action',
        body: values.action,
      }),
    )
  }

  if (JSON.stringify(nextLocal) !== JSON.stringify(buildEndpointPayload(normalizedCurrent.local))) {
    patchRequests.push(() =>
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/endpoints/local',
        body: nextLocal,
      }),
    )
  }

  if (JSON.stringify(nextRemote) !== JSON.stringify(buildEndpointPayload(normalizedCurrent.remote))) {
    patchRequests.push(() =>
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/endpoints/remote',
        body: nextRemote,
      }),
    )
  }

  if (nextTraffic !== currentTraffic) {
    if (nextTraffic === undefined) {
      patchRequests.push(() =>
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: '/spec/session',
        }),
      )
    } else {
      patchRequests.push(() =>
        patchEntryWithReplaceOp({
          endpoint,
          pathToValue: '/spec/session',
          body: { traffic: nextTraffic },
        }),
      )
    }
  }

  if (JSON.stringify(nextTransport) !== JSON.stringify(currentRule.spec?.transport)) {
    if (nextTransport === undefined) {
      patchRequests.push(() =>
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: '/spec/transport',
        }),
      )
    } else {
      patchRequests.push(() =>
        patchEntryWithReplaceOp({
          endpoint,
          pathToValue: '/spec/transport',
          body: nextTransport,
        }),
      )
    }
  }

  return runSequentialRequests(patchRequests)
}
