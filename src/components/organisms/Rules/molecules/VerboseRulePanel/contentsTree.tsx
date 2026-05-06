import React from 'react'
import { Tooltip, Typography } from 'antd'
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
import { groupTreeDataByNamespace, renderBadgeWithValue, renderNamespacedResourceValue } from 'utils'
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

const makeChildKey = (parentKey: string, key: string) => `${parentKey}-${key}`

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
  title: (
    <>
      {label} <span style={{ color: countColor, fontWeight: 600 }}>({count})</span>
    </>
  ),
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
    return renderBadgeWithValue(badgeValue, resource.spec.displayName)
  }

  if (resource?.metadata?.name) {
    return renderBadgeWithValue(badgeValue, resource.metadata.name)
  }

  if (fallback?.name) {
    return renderBadgeWithValue(badgeValue, fallback.name)
  }

  return 'Unknown'
}

const renderBindingLabel = (
  badgeValue: 'HostBinding' | 'NetworkBinding' | 'ServiceBinding',
  binding: THostBindingResource | TNetworkBindingResource | TServiceBindingResource,
  fallback: React.ReactNode,
) => renderBadgeWithValue(badgeValue, binding.spec?.displayName || binding.metadata.name || fallback)

const buildHostBindingNode = (
  binding: THostBindingResource,
  hostsByKey: Record<string, THostResource>,
  parentKey: string,
  hostsError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.host
  const key = makeLookupKey(target)
  const host = hostsByKey[key]
  const bindingKey = makeChildKey(
    parentKey,
    `host-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )
  const bindingTitle = renderBindingLabel('HostBinding', binding, renderLabel('Host', host, target))

  if (!host) {
    return {
      title: bindingTitle,
      key: bindingKey,
      children: [createLeaf(hostsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, makeChildKey(bindingKey, 'status'))],
    }
  }

  const resourceKey = makeChildKey(bindingKey, 'resource')
  const normalizedIps = host.ips || host.spec?.IPs
  const ipChildren = [...(normalizedIps?.IPv4 || []), ...(normalizedIps?.IPv6 || [])].map(ip =>
    createLeaf(ip, makeChildKey(resourceKey, `ip-${ip}`)),
  )

  return {
    title: bindingTitle,
    key: bindingKey,
    children: [
      {
        title: renderLabel('Host', host, target),
        key: resourceKey,
        children: ipChildren.length > 0 ? ipChildren : [createLeaf('No IPs', makeChildKey(resourceKey, 'empty'))],
      },
    ],
  }
}

const buildNetworkBindingNode = (
  binding: TNetworkBindingResource,
  networksByKey: Record<string, TNetworkResource>,
  parentKey: string,
  networksError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.network
  const key = makeLookupKey(target)
  const network = networksByKey[key]
  const bindingKey = makeChildKey(
    parentKey,
    `network-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )
  const bindingTitle = renderBindingLabel('NetworkBinding', binding, renderLabel('Network', network, target))

  if (!network) {
    return {
      title: bindingTitle,
      key: bindingKey,
      children: [
        createLeaf(networksError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, makeChildKey(bindingKey, 'status')),
      ],
    }
  }

  const resourceKey = makeChildKey(bindingKey, 'resource')

  return {
    title: bindingTitle,
    key: bindingKey,
    children: [
      {
        title: renderLabel('Network', network, target),
        key: resourceKey,
        children: [createLeaf(network.spec?.CIDR || 'No CIDR', makeChildKey(resourceKey, 'cidr'))],
      },
    ],
  }
}

const buildServiceBindingNode = (
  binding: TServiceBindingResource,
  servicesByKey: Record<string, TServiceResource>,
  parentKey: string,
  servicesError?: boolean,
): TreeDataNode => {
  const target = binding.spec?.service
  const key = makeLookupKey(target)
  const service = servicesByKey[key]
  const bindingKey = makeChildKey(
    parentKey,
    `service-binding-${binding.metadata.namespace || 'all'}-${binding.metadata.name || key}`,
  )
  const bindingTitle = renderBindingLabel('ServiceBinding', binding, renderLabel('Service', service, target))

  if (!service) {
    return {
      title: bindingTitle,
      key: bindingKey,
      children: [
        createLeaf(servicesError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE, makeChildKey(bindingKey, 'status')),
      ],
    }
  }

  const resourceKey = makeChildKey(bindingKey, 'resource')
  const transportChildren =
    service.spec?.transports && service.spec.transports.length > 0
      ? service.spec.transports.map((transport, transportIndex) => {
          const transportKey = makeChildKey(resourceKey, `transport-${transportIndex}`)

          return {
            title: `${transport.protocol || 'Unknown protocol'} / ${transport.IPv || 'Unknown IP family'}`,
            key: transportKey,
            children:
              transport.entries && transport.entries.length > 0
                ? transport.entries.map((entry, entryIndex) => {
                    return createLeaf(
                      renderTransportEntryTitle(entry),
                      makeChildKey(transportKey, `entry-${entryIndex}`),
                    )
                  })
                : [createLeaf('No entries', makeChildKey(transportKey, 'empty'))],
          }
        })
      : [createLeaf('No transports', makeChildKey(resourceKey, 'empty'))]

  return {
    title: bindingTitle,
    key: bindingKey,
    children: [
      {
        title: renderLabel('Service', service, target),
        key: resourceKey,
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
    const serviceEndpointKey = 'service-endpoint'
    const servicesByKey = Object.fromEntries(services.map(service => [makeLookupKey(service.metadata), service]))
    const targetKey = makeLookupKey({ name: endpoint.name, namespace: endpoint.namespace })
    const service = servicesByKey[targetKey]

    if (!service) {
      return [
        {
          title: renderEndpointTitle(endpoint),
          key: serviceEndpointKey,
          children: [
            createLeaf(
              servicesError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE,
              makeChildKey(serviceEndpointKey, 'status'),
            ),
          ],
        },
      ]
    }

    const transportChildren =
      service.spec?.transports && service.spec.transports.length > 0
        ? service.spec.transports.map((transport, transportIndex) => {
            const transportKey = makeChildKey(serviceEndpointKey, `transport-${transportIndex}`)

            return {
              title: `${transport.protocol || 'Unknown protocol'} / ${transport.IPv || 'Unknown IP family'}`,
              key: transportKey,
              children:
                transport.entries && transport.entries.length > 0
                  ? transport.entries.map((entry, entryIndex) => {
                      return createLeaf(
                        renderTransportEntryTitle(entry),
                        makeChildKey(transportKey, `entry-${entryIndex}`),
                      )
                    })
                  : [createLeaf('No entries', makeChildKey(transportKey, 'empty'))],
            }
          })
        : [createLeaf('No transports', makeChildKey(serviceEndpointKey, 'empty'))]

    return [
      {
        title: renderLabel('Service', service, { name: endpoint.name, namespace: endpoint.namespace }),
        key: serviceEndpointKey,
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
    const addressGroupEndpointKey = 'address-group-endpoint'

    return [
      {
        title: renderEndpointTitle(endpoint),
        key: addressGroupEndpointKey,
        children: [
          createLeaf(
            addressGroupsError ? ERROR_LEAF_TITLE : NOT_FOUND_LEAF_TITLE,
            makeChildKey(addressGroupEndpointKey, 'status'),
          ),
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
  const addressGroupEndpointKey = 'address-group-endpoint'
  const hostsRootKey = makeChildKey(addressGroupEndpointKey, 'rule-hosts-root')
  const networksRootKey = makeChildKey(addressGroupEndpointKey, 'rule-networks-root')
  const servicesRootKey = makeChildKey(addressGroupEndpointKey, 'rule-services-root')

  const hostChildren = hostBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(hostsRootKey, 'error'))]
    : groupTreeDataByNamespace(
        matchedHostBindings.map(binding => ({
          namespace: binding.spec?.host?.namespace,
          node: buildHostBindingNode(binding, hostsByKey, hostsRootKey, hostsError),
        })),
        hostsRootKey,
      )
  const networkChildren = networkBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(networksRootKey, 'error'))]
    : groupTreeDataByNamespace(
        matchedNetworkBindings.map(binding => ({
          namespace: binding.spec?.network?.namespace,
          node: buildNetworkBindingNode(binding, networksByKey, networksRootKey, networksError),
        })),
        networksRootKey,
      )
  const serviceChildren = serviceBindingsError
    ? [createLeaf(ERROR_LEAF_TITLE, makeChildKey(servicesRootKey, 'error'))]
    : groupTreeDataByNamespace(
        matchedServiceBindings.map(binding => ({
          namespace: binding.spec?.service?.namespace,
          node: buildServiceBindingNode(binding, servicesByKey, servicesRootKey, servicesError),
        })),
        servicesRootKey,
      )

  return [
    {
      title: renderLabel('Address Group', addressGroup, { name: endpoint.name, namespace: endpoint.namespace }),
      key: addressGroupEndpointKey,
      children: [
        createBranch('Hosts', hostsRootKey, hostChildren, countColor, matchedHostBindings.length),
        createBranch('Networks', networksRootKey, networkChildren, countColor, matchedNetworkBindings.length),
        createBranch('Services', servicesRootKey, serviceChildren, countColor, matchedServiceBindings.length),
      ],
    },
  ]
}
