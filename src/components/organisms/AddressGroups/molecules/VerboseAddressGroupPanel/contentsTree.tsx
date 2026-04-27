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
  hostsError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.host
  const key = makeLookupKey(target)
  const host = hostsByKey[key]

  if (!host) {
    return {
      title: getDisplayLabel('Host', undefined, target),
      key: `host-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
      children: [createLeaf(hostsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `host-${key}-status`)],
    }
  }

  const normalizedIps = host.ips || host.spec?.IPs
  const ipChildren = [...(normalizedIps?.IPv4 || []), ...(normalizedIps?.IPv6 || [])].map(ip =>
    createLeaf(ip, `host-${key}-${ip}`),
  )

  return {
    title: getDisplayLabel('Host', host, target),
    key: `host-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
    children: ipChildren.length > 0 ? ipChildren : [createLeaf('No IPs', `host-${key}-empty`)],
  }
}

const buildNetworkNode = (
  binding: TNetworkBindingResource,
  networksByKey: Record<string, TNetworkResource>,
  networksError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.network
  const key = makeLookupKey(target)
  const network = networksByKey[key]

  if (!network) {
    return {
      title: getDisplayLabel('Network', undefined, target),
      key: `network-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
      children: [createLeaf(networksError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `network-${key}-status`)],
    }
  }

  return {
    title: getDisplayLabel('Network', network, target),
    key: `network-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
    children: [createLeaf(network.spec?.CIDR || 'No CIDR', `network-${key}-cidr`)],
  }
}

const buildServiceNode = (
  binding: TServiceBindingResource,
  servicesByKey: Record<string, TServiceResource>,
  servicesError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.service
  const key = makeLookupKey(target)
  const service = servicesByKey[key]

  if (!service) {
    return {
      title: getDisplayLabel('Service', undefined, target),
      key: `service-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
      children: [createLeaf(servicesError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `service-${key}-status`)],
    }
  }

  const transports = service.spec?.transports || []
  const transportChildren =
    transports.length > 0
      ? transports.map((transport, transportIndex) => ({
          title: `${transport.protocol || 'Unknown protocol'} / ${transport.IPv || 'Unknown IP family'}`,
          key: `service-${key}-transport-${transportIndex}`,
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

                  return createLeaf(parts.join(' | ') || 'Empty entry', `service-${key}-entry-${entryIndex}`)
                })
              : [createLeaf('No entries', `service-${key}-transport-${transportIndex}-empty`)],
        }))
      : [createLeaf('No transports', `service-${key}-empty`)]

  return {
    title: getDisplayLabel('Service', service, target),
    key: `service-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
    children: transportChildren,
  }
}

export const buildAddressGroupContentsTree = ({
  addressGroupName,
  addressGroupNamespace,
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

  const hostChildren = hostBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, 'hosts-error')]
    : matchedHostBindings.map(binding => buildHostNode(binding, hostsByKey, hostsError))

  const networkChildren = networkBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, 'networks-error')]
    : matchedNetworkBindings.map(binding => buildNetworkNode(binding, networksByKey, networksError))

  const serviceChildren = serviceBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, 'services-error')]
    : matchedServiceBindings.map(binding => buildServiceNode(binding, servicesByKey, servicesError))

  return [
    createBranch('Hosts', 'hosts-root', hostChildren, countColor),
    createBranch('Networks', 'networks-root', networkChildren, countColor),
    createBranch('Services', 'services-root', serviceChildren, countColor),
  ]
}
