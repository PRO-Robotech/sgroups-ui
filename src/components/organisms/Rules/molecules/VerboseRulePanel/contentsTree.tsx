import React from 'react'
import type { TreeDataNode } from 'antd'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TResourceIdentifier,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import { renderNamespacedResourceValue } from 'utils'
import { TRuleEndpoint } from '../../tableConfig'

type TContentsTreeArgs = {
  endpoint?: TRuleEndpoint
  addressGroups?: TAddressGroupResource[]
  hostBindings?: THostBindingResource[]
  networkBindings?: TNetworkBindingResource[]
  serviceBindings?: TServiceBindingResource[]
  hosts?: THostResource[]
  networks?: TNetworkResource[]
  services?: TServiceResource[]
  addressGroupsError?: boolean
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

const createLeaf = (title: React.ReactNode, key: string): TreeDataNode => ({
  title,
  key,
  isLeaf: true,
})

const createBranch = (label: string, key: string, children: TreeDataNode[], countColor?: string): TreeDataNode => ({
  title: (
    <>
      {label} <span style={{ color: countColor, fontWeight: 600 }}>({children.length})</span>
    </>
  ),
  key,
  children: children.length > 0 ? children : [createLeaf(EMPTY_LEAF_TITLE, `${key}-empty`)],
})

const renderEndpointTitle = (endpoint?: TRuleEndpoint) => {
  if (!endpoint) {
    return 'Unknown endpoint'
  }

  const value = endpoint.type === 'FQDN' || endpoint.type === 'CIDR' ? endpoint.value : endpoint.name || endpoint.value

  if (!value) {
    return endpoint.type || 'Unknown endpoint'
  }

  return endpoint.namespace
    ? renderNamespacedResourceValue(endpoint.type || 'Endpoint', endpoint.namespace, value)
    : value
}

const renderLabel = (
  badgeValue: string,
  resource?: { metadata?: { name?: string; namespace?: string }; spec?: { displayName?: string } },
  fallback?: TResourceIdentifier,
) => {
  if (resource?.spec?.displayName) {
    return renderNamespacedResourceValue(
      badgeValue,
      resource.metadata?.namespace || fallback?.namespace,
      resource.spec.displayName,
    )
  }

  if (resource?.metadata?.name) {
    return renderNamespacedResourceValue(badgeValue, resource.metadata.namespace, resource.metadata.name)
  }

  if (fallback?.name) {
    return renderNamespacedResourceValue(badgeValue, fallback.namespace, fallback.name)
  }

  return 'Unknown'
}

const buildHostBindingNode = (
  binding: THostBindingResource,
  hostsByKey: Record<string, THostResource>,
  hostsError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.host
  const key = makeLookupKey(target)
  const host = hostsByKey[key]
  const bindingKey = `host-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`
  const bindingTitle = binding.spec?.displayName || binding.metadata.name || renderLabel('Host', host, target)

  if (!host) {
    return {
      title: bindingTitle,
      key: bindingKey,
      children: [createLeaf(hostsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${bindingKey}-status`)],
    }
  }

  const normalizedIps = host.ips || host.spec?.IPs
  const ipChildren = [...(normalizedIps?.IPv4 || []), ...(normalizedIps?.IPv6 || [])].map(ip =>
    createLeaf(ip, `${bindingKey}-${ip}`),
  )

  return {
    title: bindingTitle,
    key: bindingKey,
    children: [
      {
        title: renderLabel('Host', host, target),
        key: `${bindingKey}-resource`,
        children: ipChildren.length > 0 ? ipChildren : [createLeaf('No IPs', `${bindingKey}-empty`)],
      },
    ],
  }
}

const buildNetworkBindingNode = (
  binding: TNetworkBindingResource,
  networksByKey: Record<string, TNetworkResource>,
  networksError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.network
  const key = makeLookupKey(target)
  const network = networksByKey[key]
  const bindingKey = `network-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`
  const bindingTitle = binding.spec?.displayName || binding.metadata.name || renderLabel('Network', network, target)

  if (!network) {
    return {
      title: bindingTitle,
      key: bindingKey,
      children: [createLeaf(networksError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${bindingKey}-status`)],
    }
  }

  return {
    title: bindingTitle,
    key: bindingKey,
    children: [
      {
        title: renderLabel('Network', network, target),
        key: `${bindingKey}-resource`,
        children: [createLeaf(network.spec?.CIDR || 'No CIDR', `${bindingKey}-cidr`)],
      },
    ],
  }
}

const buildServiceBindingNode = (
  binding: TServiceBindingResource,
  servicesByKey: Record<string, TServiceResource>,
  servicesError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.service
  const key = makeLookupKey(target)
  const service = servicesByKey[key]
  const bindingKey = `service-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`
  const bindingTitle = binding.spec?.displayName || binding.metadata.name || renderLabel('Service', service, target)

  if (!service) {
    return {
      title: bindingTitle,
      key: bindingKey,
      children: [createLeaf(servicesError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, `${bindingKey}-status`)],
    }
  }

  const transportChildren =
    service.spec?.transports && service.spec.transports.length > 0
      ? service.spec.transports.map((transport, transportIndex) => ({
          title: `${transport.protocol || 'Unknown protocol'} / ${transport.IPv || 'Unknown IP family'}`,
          key: `${bindingKey}-transport-${transportIndex}`,
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

                  return createLeaf(parts.join(' | ') || 'Empty entry', `${bindingKey}-entry-${entryIndex}`)
                })
              : [createLeaf('No entries', `${bindingKey}-transport-${transportIndex}-empty`)],
        }))
      : [createLeaf('No transports', `${bindingKey}-empty`)]

  return {
    title: bindingTitle,
    key: bindingKey,
    children: [
      {
        title: renderLabel('Service', service, target),
        key: `${bindingKey}-resource`,
        children: transportChildren,
      },
    ],
  }
}

export const buildRuleEndpointTree = ({
  endpoint,
  addressGroups = [],
  hostBindings = [],
  networkBindings = [],
  serviceBindings = [],
  hosts = [],
  networks = [],
  services = [],
  addressGroupsError,
  hostBindingsError,
  networkBindingsError,
  serviceBindingsError,
  hostsError,
  networksError,
  servicesError,
  countColor,
}: TContentsTreeArgs): TreeDataNode[] => {
  if (!endpoint) {
    return [createLeaf('No endpoint configured', 'endpoint-empty')]
  }

  if (endpoint.type === 'FQDN' || endpoint.type === 'CIDR') {
    return [createLeaf(endpoint.value || renderEndpointTitle(endpoint), `endpoint-${endpoint.type || 'value'}`)]
  }

  if (endpoint.type === 'Service') {
    const servicesByKey = Object.fromEntries(services.map(service => [makeLookupKey(service.metadata), service]))
    const targetKey = makeLookupKey({ name: endpoint.name, namespace: endpoint.namespace })
    const service = servicesByKey[targetKey]

    if (!service) {
      return [
        {
          title: renderEndpointTitle(endpoint),
          key: 'service-endpoint',
          children: [createLeaf(servicesError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, 'service-endpoint-status')],
        },
      ]
    }

    const transportChildren =
      service.spec?.transports && service.spec.transports.length > 0
        ? service.spec.transports.map((transport, transportIndex) => ({
            title: `${transport.protocol || 'Unknown protocol'} / ${transport.IPv || 'Unknown IP family'}`,
            key: `service-endpoint-transport-${transportIndex}`,
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

                    return createLeaf(parts.join(' | ') || 'Empty entry', `service-endpoint-entry-${entryIndex}`)
                  })
                : [createLeaf('No entries', `service-endpoint-transport-${transportIndex}-empty`)],
          }))
        : [createLeaf('No transports', 'service-endpoint-empty')]

    return [
      {
        title: renderLabel('Service', service, { name: endpoint.name, namespace: endpoint.namespace }),
        key: 'service-endpoint',
        children: transportChildren,
      },
    ]
  }

  const targetKey = makeLookupKey({ name: endpoint.name, namespace: endpoint.namespace })
  const addressGroupsByKey = Object.fromEntries(addressGroups.map(group => [makeLookupKey(group.metadata), group]))
  const hostsByKey = Object.fromEntries(hosts.map(host => [makeLookupKey(host.metadata), host]))
  const networksByKey = Object.fromEntries(networks.map(network => [makeLookupKey(network.metadata), network]))
  const servicesByKey = Object.fromEntries(services.map(service => [makeLookupKey(service.metadata), service]))
  const addressGroup = addressGroupsByKey[targetKey]

  if (!addressGroup) {
    return [
      {
        title: renderEndpointTitle(endpoint),
        key: 'address-group-endpoint',
        children: [
          createLeaf(addressGroupsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, 'address-group-endpoint-status'),
        ],
      },
    ]
  }

  const matchedHostBindings = hostBindings.filter(binding => makeLookupKey(binding.spec?.addressGroup) === targetKey)
  const matchedNetworkBindings = networkBindings.filter(
    binding => makeLookupKey(binding.spec?.addressGroup) === targetKey,
  )
  const matchedServiceBindings = serviceBindings.filter(
    binding => makeLookupKey(binding.spec?.addressGroup) === targetKey,
  )

  const hostChildren = hostBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, 'rule-hosts-error')]
    : matchedHostBindings.map(binding => buildHostBindingNode(binding, hostsByKey, hostsError))
  const networkChildren = networkBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, 'rule-networks-error')]
    : matchedNetworkBindings.map(binding => buildNetworkBindingNode(binding, networksByKey, networksError))
  const serviceChildren = serviceBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, 'rule-services-error')]
    : matchedServiceBindings.map(binding => buildServiceBindingNode(binding, servicesByKey, servicesError))

  return [
    {
      title: renderLabel('Address Group', addressGroup, { name: endpoint.name, namespace: endpoint.namespace }),
      key: 'address-group-endpoint',
      children: [
        createBranch('Hosts', 'rule-hosts-root', hostChildren, countColor),
        createBranch('Networks', 'rule-networks-root', networkChildren, countColor),
        createBranch('Services', 'rule-services-root', serviceChildren, countColor),
      ],
    },
  ]
}
