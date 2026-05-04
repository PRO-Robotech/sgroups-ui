import React from 'react'
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
import { renderNamespacedResourceValue } from 'utils'

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

const withNamespaceLabel = (kind: 'Host' | 'Network' | 'Service', name?: string, namespace?: string) => {
  if (!name) {
    return 'Unknown'
  }

  return renderNamespacedResourceValue(kind, namespace, name)
}

const getDisplayLabel = (
  kind: 'Host' | 'Network' | 'Service',
  resource?: { metadata?: { name?: string; namespace?: string }; spec?: { displayName?: string } },
  identifier?: TResourceIdentifier,
) => {
  if (resource?.spec?.displayName) {
    return withNamespaceLabel(kind, resource.spec.displayName, resource.metadata?.namespace || identifier?.namespace)
  }

  if (resource?.metadata?.name) {
    return withNamespaceLabel(kind, resource.metadata.name, resource.metadata?.namespace)
  }

  return withNamespaceLabel(kind, identifier?.name, identifier?.namespace)
}

const createLeaf = (title: React.ReactNode, key: string): TreeDataNode => ({
  title,
  key,
  isLeaf: true,
})

const createBranch = (label: string, key: string, children: TreeDataNode[], countColor?: string): TreeDataNode => ({
  title: renderCount(label, children.length, countColor),
  key,
  children: children.length > 0 ? children : [createLeaf(EMPTY_LEAF_TITLE, `${key}-empty`)],
})

const matchesAddressGroup = (binding: TBindingBase, addressGroupName?: string, addressGroupNamespace?: string) =>
  binding.spec?.addressGroup?.name === addressGroupName &&
  (binding.spec?.addressGroup?.namespace || '') === (addressGroupNamespace || '')

const buildHostNode = (
  binding: THostBindingResource,
  hostsByKey: Record<string, THostResource>,
  parentKey: string,
  hostsError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.host
  const key = makeLookupKey(target)
  const host = hostsByKey[key]
  const nodeKey = makeChildKey(parentKey, `host-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`)

  if (!host) {
    return {
      title: getDisplayLabel('Host', undefined, target),
      key: nodeKey,
      children: [createLeaf(hostsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${nodeKey}-status`)],
    }
  }

  const normalizedIps = host.ips || host.spec?.IPs
  const ipChildren = [...(normalizedIps?.IPv4 || []), ...(normalizedIps?.IPv6 || [])].map(ip =>
    createLeaf(ip, `${nodeKey}-ip-${ip}`),
  )

  return {
    title: getDisplayLabel('Host', host, target),
    key: nodeKey,
    children: ipChildren.length > 0 ? ipChildren : [createLeaf('No IPs', `${nodeKey}-empty`)],
  }
}

const buildNetworkNode = (
  binding: TNetworkBindingResource,
  networksByKey: Record<string, TNetworkResource>,
  parentKey: string,
  networksError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.network
  const key = makeLookupKey(target)
  const network = networksByKey[key]
  const nodeKey = makeChildKey(
    parentKey,
    `network-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )

  if (!network) {
    return {
      title: getDisplayLabel('Network', undefined, target),
      key: nodeKey,
      children: [createLeaf(networksError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${nodeKey}-status`)],
    }
  }

  return {
    title: getDisplayLabel('Network', network, target),
    key: nodeKey,
    children: [createLeaf(network.spec?.CIDR || 'No CIDR', `${nodeKey}-cidr`)],
  }
}

const buildServiceNode = (
  binding: TServiceBindingResource,
  servicesByKey: Record<string, TServiceResource>,
  parentKey: string,
  servicesError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.service
  const key = makeLookupKey(target)
  const service = servicesByKey[key]
  const nodeKey = makeChildKey(
    parentKey,
    `service-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )

  if (!service) {
    return {
      title: getDisplayLabel('Service', undefined, target),
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
                  const parts = []

                  if (entry.ports) {
                    parts.push(`Ports: ${entry.ports}`)
                  }

                  if (entry.types && entry.types.length > 0) {
                    parts.push(`Types: ${entry.types.join(', ')}`)
                  }

                  return createLeaf(
                    parts.join(' | ') || 'Empty entry',
                    `${nodeKey}-transport-${transportIndex}-entry-${entryIndex}`,
                  )
                })
              : [createLeaf('No entries', `${nodeKey}-transport-${transportIndex}-empty`)],
        }))
      : [createLeaf('No transports', `${nodeKey}-empty`)]

  return {
    title: getDisplayLabel('Service', service, target),
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
}: TContentsTreeArgs): TreeDataNode[] => {
  const hostsByKey = Object.fromEntries(hosts.map(host => [makeLookupKey(host.metadata), host]))
  const networksByKey = Object.fromEntries(networks.map(network => [makeLookupKey(network.metadata), network]))
  const servicesByKey = Object.fromEntries(services.map(service => [makeLookupKey(service.metadata), service]))

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
    : matchedHostBindings.map(binding => buildHostNode(binding, hostsByKey, hostsRootKey, hostsError))

  const networkChildren = networkBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(networksRootKey, 'error'))]
    : matchedNetworkBindings.map(binding => buildNetworkNode(binding, networksByKey, networksRootKey, networksError))

  const serviceChildren = serviceBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(servicesRootKey, 'error'))]
    : matchedServiceBindings.map(binding => buildServiceNode(binding, servicesByKey, servicesRootKey, servicesError))

  return [
    createBranch('Hosts', hostsRootKey, hostChildren, countColor),
    createBranch('Networks', networksRootKey, networkChildren, countColor),
    createBranch('Services', servicesRootKey, serviceChildren, countColor),
  ]
}
