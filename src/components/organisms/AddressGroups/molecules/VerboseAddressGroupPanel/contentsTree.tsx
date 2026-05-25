import React from 'react'
import { Tooltip, Typography } from 'antd'
import type { TreeDataNode } from 'antd'
import {
  TBindingBase,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TResourceIdentifier,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import {
  buildNamespacedValue,
  groupTreeDataByNamespace,
  renderBadgeWithValue,
  renderLinkedTreeResourceTitle,
  renderTreeChangeHighlight,
  TSgroupsResourcePlural,
} from 'utils'

type TContentsTreeArgs = {
  addressGroupName?: string
  addressGroupNamespace?: string
  keyPrefix?: string
  hostBindings?: THostBindingResource[]
  networkBindings?: TNetworkBindingResource[]
  serviceBindings?: TServiceBindingResource[]
  hosts?: THostResource[]
  networks?: TNetworkResource[]
  services?: TServiceResource[]
  hostBindingsError?: boolean
  networkBindingsError?: boolean
  serviceBindingsError?: boolean
  hostsError?: boolean
  networksError?: boolean
  servicesError?: boolean
  countColor?: string
  highlightedHosts?: string[]
  highlightedNetworks?: string[]
  highlightedServices?: string[]
}

const EMPTY_LEAF_TITLE = 'No bound resources'
const ERROR_LEAF_TITLE = 'Error while fetching'
const NOT_FOUND_LEAF_TITLE = 'Not found'

const makeLookupKey = (identifier?: TResourceIdentifier) =>
  `${identifier?.namespace || 'all'}::${identifier?.name || 'unknown'}`

const makeChildKey = (parentKey: string, key: string) => `${parentKey}-${key}`
const makeRootKey = (key: string, prefix?: string) => (prefix ? makeChildKey(prefix, key) : key)

const renderCount = (label: string, count: number, color?: string) => (
  <>
    {label} <span style={{ color, fontWeight: 600 }}>({count})</span>
  </>
)

const renderMaybeNew = (title: React.ReactNode, isNew?: boolean) => {
  if (!isNew) {
    return title
  }

  return renderTreeChangeHighlight(title, 'Added')
}

const getResourcePlural = (kind: 'Host' | 'Network' | 'Service'): TSgroupsResourcePlural => {
  if (kind === 'Host') {
    return 'hosts'
  }

  if (kind === 'Network') {
    return 'networks'
  }

  return 'services'
}

const withResourceLabel = (kind: 'Host' | 'Network' | 'Service', name?: string, identifier?: TResourceIdentifier) => {
  if (!name) {
    return 'Unknown'
  }

  return renderLinkedTreeResourceTitle({
    label: renderBadgeWithValue(kind, name),
    name: identifier?.name,
    namespace: identifier?.namespace,
    plural: getResourcePlural(kind),
  })
}

const getDisplayLabel = (
  kind: 'Host' | 'Network' | 'Service',
  resource?: { metadata?: { name?: string; namespace?: string }; spec?: { displayName?: string } },
  identifier?: TResourceIdentifier,
) => {
  if (resource?.spec?.displayName) {
    return withResourceLabel(kind, resource.spec.displayName, resource.metadata)
  }

  if (resource?.metadata?.name) {
    return withResourceLabel(kind, resource.metadata.name, resource.metadata)
  }

  return withResourceLabel(kind, identifier?.name, identifier)
}

const createLeaf = (title: React.ReactNode, key: string): TreeDataNode => ({
  title,
  key,
  isLeaf: true,
})

const createBranch = (
  label: string,
  key: string,
  children: TreeDataNode[],
  countColor?: string,
  count = children.length,
): TreeDataNode => ({
  title: renderCount(label, count, countColor),
  key,
  children: children.length > 0 ? children : [createLeaf(EMPTY_LEAF_TITLE, `${key}-empty`)],
})

const formatTransportEntryText = (entry: {
  ports?: string
  types?: number[]
  description?: string
  comment?: string
}) => {
  const parts = []

  if (entry.ports) {
    parts.push(`Ports: ${entry.ports}`)
  }

  if (entry.types && entry.types.length > 0) {
    parts.push(`Types: ${entry.types.join(', ')}`)
  }

  return parts.join(' | ') || 'Empty entry'
}

const renderTransportEntryTooltip = (entry: { description?: string; comment?: string }) => {
  const details: Array<[string, string]> = []

  if (entry.description) {
    details.push(['Description', entry.description])
  }

  if (entry.comment) {
    details.push(['Comment', entry.comment])
  }

  if (details.length === 0) {
    return undefined
  }

  return (
    <>
      {details.map(([label, value]) => (
        <div key={label}>
          <Typography.Text strong>{label}:</Typography.Text> {value}
        </div>
      ))}
    </>
  )
}

const renderTransportEntryTitle = (entry: {
  ports?: string
  types?: number[]
  description?: string
  comment?: string
}) => {
  const text = formatTransportEntryText(entry)
  const tooltip = renderTransportEntryTooltip(entry)

  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>{text}</span>
    </Tooltip>
  ) : (
    text
  )
}

const matchesAddressGroup = (binding: TBindingBase, addressGroupName?: string, addressGroupNamespace?: string) =>
  binding.spec?.addressGroup?.name === addressGroupName &&
  (binding.spec?.addressGroup?.namespace || '') === (addressGroupNamespace || '')

const withBindingNamespaceFallback = (identifier: TResourceIdentifier | undefined, bindingNamespace?: string) => ({
  ...identifier,
  namespace: identifier?.namespace || bindingNamespace,
})

const buildHostNode = (
  binding: THostBindingResource,
  hostsByKey: Record<string, THostResource>,
  parentKey: string,
  hostsError?: boolean,
  highlightedHosts?: Set<string>,
): TreeDataNode => {
  const target = withBindingNamespaceFallback(binding.spec?.host, binding.metadata.namespace)
  const key = makeLookupKey(target)
  const host = hostsByKey[key]
  const nodeKey = makeChildKey(parentKey, `host-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`)
  const isNew = Boolean(highlightedHosts?.has(buildNamespacedValue(target) || ''))

  if (!host) {
    return {
      title: renderMaybeNew(getDisplayLabel('Host', undefined, target), isNew),
      key: nodeKey,
      children: [createLeaf(hostsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${nodeKey}-status`)],
    }
  }

  const normalizedIps = host.ips || host.spec?.IPs
  const ipChildren = [...(normalizedIps?.IPv4 || []), ...(normalizedIps?.IPv6 || [])].map(ip =>
    createLeaf(ip, `${nodeKey}-ip-${ip}`),
  )

  return {
    title: renderMaybeNew(getDisplayLabel('Host', host, target), isNew),
    key: nodeKey,
    children: ipChildren.length > 0 ? ipChildren : [createLeaf('No IPs', `${nodeKey}-empty`)],
  }
}

const buildNetworkNode = (
  binding: TNetworkBindingResource,
  networksByKey: Record<string, TNetworkResource>,
  parentKey: string,
  networksError?: boolean,
  highlightedNetworks?: Set<string>,
): TreeDataNode => {
  const target = withBindingNamespaceFallback(binding.spec?.network, binding.metadata.namespace)
  const key = makeLookupKey(target)
  const network = networksByKey[key]
  const nodeKey = makeChildKey(
    parentKey,
    `network-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )
  const isNew = Boolean(highlightedNetworks?.has(buildNamespacedValue(target) || ''))

  if (!network) {
    return {
      title: renderMaybeNew(getDisplayLabel('Network', undefined, target), isNew),
      key: nodeKey,
      children: [createLeaf(networksError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${nodeKey}-status`)],
    }
  }

  return {
    title: renderMaybeNew(getDisplayLabel('Network', network, target), isNew),
    key: nodeKey,
    children: [createLeaf(network.spec?.CIDR || 'No CIDR', `${nodeKey}-cidr`)],
  }
}

const buildServiceNode = (
  binding: TServiceBindingResource,
  servicesByKey: Record<string, TServiceResource>,
  parentKey: string,
  servicesError?: boolean,
  highlightedServices?: Set<string>,
): TreeDataNode => {
  const target = withBindingNamespaceFallback(binding.spec?.service, binding.metadata.namespace)
  const key = makeLookupKey(target)
  const service = servicesByKey[key]
  const nodeKey = makeChildKey(
    parentKey,
    `service-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )
  const isNew = Boolean(highlightedServices?.has(buildNamespacedValue(target) || ''))

  if (!service) {
    return {
      title: renderMaybeNew(getDisplayLabel('Service', undefined, target), isNew),
      key: nodeKey,
      children: [createLeaf(servicesError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${nodeKey}-status`)],
    }
  }

  const transports = service.spec?.transports || []
  const transportChildren =
    transports.length > 0
      ? transports.map((transport, transportIndex) => ({
          title: `${transport.protocol || 'Unknown protocol'} / ${transport.IPv || 'Unknown IP family'}`,
          key: `${nodeKey}-transport-${transportIndex}`,
          children:
            transport.entries && transport.entries.length > 0
              ? transport.entries.map((entry, entryIndex) => {
                  return createLeaf(
                    renderTransportEntryTitle(entry),
                    `${nodeKey}-transport-${transportIndex}-entry-${entryIndex}`,
                  )
                })
              : [createLeaf('No entries', `${nodeKey}-transport-${transportIndex}-empty`)],
        }))
      : [createLeaf('No transports', `${nodeKey}-empty`)]

  return {
    title: renderMaybeNew(getDisplayLabel('Service', service, target), isNew),
    key: nodeKey,
    children: transportChildren,
  }
}

export const buildAddressGroupContentsTree = ({
  addressGroupName,
  addressGroupNamespace,
  keyPrefix,
  hostBindings = [],
  networkBindings = [],
  serviceBindings = [],
  hosts = [],
  networks = [],
  services = [],
  hostBindingsError,
  networkBindingsError,
  serviceBindingsError,
  hostsError,
  networksError,
  servicesError,
  countColor,
  highlightedHosts = [],
  highlightedNetworks = [],
  highlightedServices = [],
}: TContentsTreeArgs): TreeDataNode[] => {
  const hostsByKey = Object.fromEntries(hosts.map(host => [makeLookupKey(host.metadata), host]))
  const networksByKey = Object.fromEntries(networks.map(network => [makeLookupKey(network.metadata), network]))
  const servicesByKey = Object.fromEntries(services.map(service => [makeLookupKey(service.metadata), service]))
  const highlightedHostValues = new Set(highlightedHosts)
  const highlightedNetworkValues = new Set(highlightedNetworks)
  const highlightedServiceValues = new Set(highlightedServices)

  const matchedHostBindings = hostBindings.filter(binding =>
    matchesAddressGroup(binding, addressGroupName, addressGroupNamespace),
  )
  const matchedNetworkBindings = networkBindings.filter(binding =>
    matchesAddressGroup(binding, addressGroupName, addressGroupNamespace),
  )
  const matchedServiceBindings = serviceBindings.filter(binding =>
    matchesAddressGroup(binding, addressGroupName, addressGroupNamespace),
  )
  const hostsRootKey = makeRootKey('hosts-root', keyPrefix)
  const networksRootKey = makeRootKey('networks-root', keyPrefix)
  const servicesRootKey = makeRootKey('services-root', keyPrefix)

  const hostChildren = hostBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(hostsRootKey, 'error'))]
    : groupTreeDataByNamespace(
        matchedHostBindings.map(binding => ({
          namespace: binding.spec?.host?.namespace || binding.metadata.namespace,
          node: buildHostNode(binding, hostsByKey, hostsRootKey, hostsError, highlightedHostValues),
        })),
        hostsRootKey,
      )

  const networkChildren = networkBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(networksRootKey, 'error'))]
    : groupTreeDataByNamespace(
        matchedNetworkBindings.map(binding => ({
          namespace: binding.spec?.network?.namespace || binding.metadata.namespace,
          node: buildNetworkNode(binding, networksByKey, networksRootKey, networksError, highlightedNetworkValues),
        })),
        networksRootKey,
      )

  const serviceChildren = serviceBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(servicesRootKey, 'error'))]
    : groupTreeDataByNamespace(
        matchedServiceBindings.map(binding => ({
          namespace: binding.spec?.service?.namespace || binding.metadata.namespace,
          node: buildServiceNode(binding, servicesByKey, servicesRootKey, servicesError, highlightedServiceValues),
        })),
        servicesRootKey,
      )

  return [
    createBranch('Hosts', hostsRootKey, hostChildren, countColor, matchedHostBindings.length),
    createBranch('Networks', networksRootKey, networkChildren, countColor, matchedNetworkBindings.length),
    createBranch('Services', servicesRootKey, serviceChildren, countColor, matchedServiceBindings.length),
  ]
}
