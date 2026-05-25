import type { TreeDataNode } from 'antd'
import {
  createNewEntry,
  deleteEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
} from '@prorobotech/openapi-k8s-toolkit'
import { buildAddressGroupContentsTree } from 'components/organisms/AddressGroups/molecules/VerboseAddressGroupPanel/contentsTree'
import { TAddressGroupResource } from 'components/organisms/AddressGroups/tableConfig'
import {
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import {
  buildNamespacedValue,
  renderBadgeWithValue,
  renderLinkedTreeResourceTitle,
  renderNamespacedResourceValue,
  runSequentialRequests,
} from 'utils'
import { Styled } from './styled'
import { TAddressGroupFormValues, TCurrentBindings, TResourceOption, TSelectableResource } from './types'

export const API_GROUP = 'sgroups.io'
export const API_VERSION = 'v1alpha1'
export const API_RESOURCE_VERSION = `${API_GROUP}/${API_VERSION}`
export const NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/

export const getApiEndpoint = (cluster: string, namespace: string, plural: string) =>
  `/api/clusters/${cluster}/k8s/apis/${API_GROUP}/${API_VERSION}/namespaces/${namespace}/${plural}`

export const compactSpec = (spec: Record<string, string | boolean | undefined>) =>
  Object.fromEntries(Object.entries(spec).filter(([, value]) => value !== undefined && value !== ''))

export const normalizeOptionalString = (value?: string) => {
  const trimmedValue = value?.trim()

  return trimmedValue || undefined
}

const sanitizeBindingName = (value: string) => {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)
    .replace(/-$/g, '')

  return sanitized || 'binding'
}

const buildBindingName = (addressGroupName: string, kind: 'host' | 'service' | 'network', resourceName: string) =>
  sanitizeBindingName(`${addressGroupName}-${kind}-${resourceName}`)

export const renderResourceOptionLabel = (kind: 'Host' | 'Service' | 'Network', value: string) =>
  renderBadgeWithValue(kind, value)

export const renderNamespacedResourceOptionLabel = (
  kind: 'Host' | 'Service' | 'Network',
  namespace: string | undefined,
  value: string | undefined,
) => renderNamespacedResourceValue(kind, namespace, value)

export const getResourceOptions = (kind: 'Host' | 'Network', items?: TSelectableResource[]): TResourceOption[] =>
  (items || [])
    .reduce<TResourceOption[]>((acc, item) => {
      const resourceName = item.metadata.name

      if (!resourceName) {
        return acc
      }

      const displayName = item.spec?.displayName || resourceName

      acc.push({
        value: resourceName,
        label: renderResourceOptionLabel(kind, displayName),
        searchText: displayName,
      })

      return acc
    }, [])
    .sort((first, second) => first.searchText.localeCompare(second.searchText))

export const getNamespacedResourceOptions = (items?: TSelectableResource[]): TResourceOption[] =>
  (items || [])
    .reduce<TResourceOption[]>((acc, item) => {
      const { name, namespace: resourceNamespace } = item.metadata

      if (!name || !resourceNamespace) {
        return acc
      }

      const displayName = item.spec?.displayName || name

      acc.push({
        value: `${resourceNamespace}/${name}`,
        label: renderNamespacedResourceOptionLabel('Service', resourceNamespace, displayName),
        searchText: `${resourceNamespace} ${displayName}`.trim(),
      })

      return acc
    }, [])
    .sort((first, second) => first.searchText.localeCompare(second.searchText))

export const parseNamespacedValue = (value: string) => {
  const [resourceNamespace, ...nameParts] = value.split('/')

  return {
    namespace: resourceNamespace,
    name: nameParts.join('/'),
  }
}

export const getBindingLookupKey = (resource?: { name?: string; namespace?: string }) =>
  resource?.name ? `${resource.namespace || ''}/${resource.name}` : null

const isSameAddressGroup = (
  resource: TAddressGroupResource | null | undefined,
  addressGroupRef?: { name?: string; namespace?: string },
) => addressGroupRef?.name === resource?.metadata.name && addressGroupRef?.namespace === resource?.metadata.namespace

export const buildCurrentBindings = (
  addressGroup: TAddressGroupResource | null | undefined,
  hostBindings?: THostBindingResource[],
  serviceBindings?: TServiceBindingResource[],
  networkBindings?: TNetworkBindingResource[],
): TCurrentBindings => ({
  hosts: (hostBindings || []).filter(binding => isSameAddressGroup(addressGroup, binding.spec?.addressGroup)),
  services: (serviceBindings || []).filter(binding => isSameAddressGroup(addressGroup, binding.spec?.addressGroup)),
  networks: (networkBindings || []).filter(binding => isSameAddressGroup(addressGroup, binding.spec?.addressGroup)),
})

const renderOverviewRootTitle = (
  displayName: string,
  count: number,
  identifier?: { name?: string; namespace?: string },
) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
    {renderLinkedTreeResourceTitle({
      label: renderBadgeWithValue('AddressGroup', displayName),
      name: identifier?.name,
      namespace: identifier?.namespace,
      plural: 'addressgroups',
    })}
    <Styled.Count>{count}</Styled.Count>
  </span>
)

export const buildOverviewTreeData = ({
  addressGroup,
  values,
  hosts,
  networks,
  services,
  addedHosts = [],
  addedNetworks = [],
  addedServices = [],
}: {
  addressGroup?: TAddressGroupResource | null
  values: Pick<TAddressGroupFormValues, 'namespace' | 'name' | 'displayName' | 'hosts' | 'networks' | 'services'>
  hosts?: THostResource[]
  networks?: TNetworkResource[]
  services?: TServiceResource[]
  addedHosts?: string[]
  addedNetworks?: string[]
  addedServices?: string[]
}): TreeDataNode[] => {
  const addressGroupName = values.name || addressGroup?.metadata.name || 'pending-address-group'
  const addressGroupNamespace = values.namespace || addressGroup?.metadata.namespace || ''
  const addressGroupIdentifier = {
    name: addressGroupName,
    namespace: addressGroupNamespace,
  }
  const selectedHosts = values.hosts || []
  const selectedNetworks = values.networks || []
  const selectedServices = values.services || []
  const selectedItemsCount = selectedHosts.length + selectedNetworks.length + selectedServices.length
  const displayName = values.displayName || addressGroup?.spec?.displayName || addressGroupName || 'Address group'

  const hostBindings = selectedHosts.map(
    hostName =>
      ({
        metadata: {
          name: `overview-host-${hostName}`,
          namespace: addressGroupNamespace,
        },
        spec: {
          addressGroup: addressGroupIdentifier,
          host: {
            name: hostName,
            namespace: addressGroupNamespace,
          },
        },
      }) as THostBindingResource,
  )
  const networkBindings = selectedNetworks.map(
    networkName =>
      ({
        metadata: {
          name: `overview-network-${networkName}`,
          namespace: addressGroupNamespace,
        },
        spec: {
          addressGroup: addressGroupIdentifier,
          network: {
            name: networkName,
            namespace: addressGroupNamespace,
          },
        },
      }) as TNetworkBindingResource,
  )
  const serviceBindings = selectedServices.map(serviceValue => {
    const service = parseNamespacedValue(serviceValue)

    return {
      metadata: {
        name: `overview-service-${service.namespace}-${service.name}`,
        namespace: service.namespace,
      },
      spec: {
        addressGroup: addressGroupIdentifier,
        service,
      },
    } as TServiceBindingResource
  })

  return [
    {
      title: renderOverviewRootTitle(displayName, selectedItemsCount, addressGroupIdentifier),
      key: 'overview-address-group',
      children: buildAddressGroupContentsTree({
        addressGroupName,
        addressGroupNamespace,
        keyPrefix: 'overview-address-group',
        hostBindings,
        networkBindings,
        serviceBindings,
        hosts,
        networks,
        services,
        highlightedHosts: addedHosts
          .map(hostName => buildNamespacedValue({ name: hostName, namespace: addressGroupNamespace }))
          .filter((value): value is string => Boolean(value)),
        highlightedNetworks: addedNetworks
          .map(networkName => buildNamespacedValue({ name: networkName, namespace: addressGroupNamespace }))
          .filter((value): value is string => Boolean(value)),
        highlightedServices: addedServices,
      }),
    },
  ]
}

export const patchEditableSpec = async (
  endpoint: string,
  addressGroup: TAddressGroupResource,
  values: TAddressGroupFormValues,
) => {
  const patchRequests: Array<() => Promise<unknown>> = []
  const nextDefaultAction = values.allowAccess ? 'Allow' : 'Deny'
  const currentDefaultAction = addressGroup.spec?.defaultAction || 'Deny'

  if (nextDefaultAction !== currentDefaultAction) {
    patchRequests.push(() =>
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/defaultAction',
        body: nextDefaultAction,
      }),
    )
  }

  ;(
    [
      ['displayName', normalizeOptionalString(values.displayName)],
      ['description', normalizeOptionalString(values.description)],
      ['comment', normalizeOptionalString(values.comment)],
    ] as const
  ).forEach(([fieldName, nextValue]) => {
    const currentValue = normalizeOptionalString(addressGroup.spec?.[fieldName])

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

  return runSequentialRequests(patchRequests)
}

export const syncBindings = async (
  cluster: string,
  addressGroupIdentifier: { name: string; namespace: string },
  values: TAddressGroupFormValues,
  currentBindings: TCurrentBindings,
) => {
  const requestedHosts = new Set(values.hosts || [])
  const requestedServices = new Set(values.services || [])
  const requestedNetworks = new Set(values.networks || [])

  const currentHostKeys = new Set(
    currentBindings.hosts.map(binding => binding.spec?.host?.name).filter(Boolean) as string[],
  )
  const currentServiceKeys = new Set(
    currentBindings.services
      .map(binding => getBindingLookupKey(binding.spec?.service))
      .filter((value): value is string => Boolean(value)),
  )
  const currentNetworkKeys = new Set(
    currentBindings.networks
      .map(binding => binding.spec?.network?.name)
      .filter((value): value is string => Boolean(value)),
  )

  const createHostBindings = [...requestedHosts]
    .filter(resourceName => !currentHostKeys.has(resourceName))
    .map(
      resourceName => () =>
        createNewEntry({
          endpoint: getApiEndpoint(cluster, values.namespace, 'hostbindings'),
          body: {
            apiVersion: API_RESOURCE_VERSION,
            kind: 'HostBinding',
            metadata: {
              name: buildBindingName(values.name, 'host', resourceName),
              namespace: values.namespace,
            },
            spec: {
              addressGroup: addressGroupIdentifier,
              host: {
                name: resourceName,
                namespace: values.namespace,
              },
              description: values.description,
              comment: values.comment,
            },
          },
        }),
    )

  const createServiceBindings = [...requestedServices]
    .filter(resourceValue => !currentServiceKeys.has(resourceValue))
    .map(resourceValue => {
      const service = parseNamespacedValue(resourceValue)

      return () =>
        createNewEntry({
          endpoint: getApiEndpoint(cluster, service.namespace, 'servicebindings'),
          body: {
            apiVersion: API_RESOURCE_VERSION,
            kind: 'ServiceBinding',
            metadata: {
              name: buildBindingName(values.name, 'service', service.name),
              namespace: service.namespace,
            },
            spec: {
              addressGroup: addressGroupIdentifier,
              service: {
                name: service.name,
                namespace: service.namespace,
              },
              description: values.description,
              comment: values.comment,
            },
          },
        })
    })

  const createNetworkBindings = [...requestedNetworks]
    .filter(resourceName => !currentNetworkKeys.has(resourceName))
    .map(
      resourceName => () =>
        createNewEntry({
          endpoint: getApiEndpoint(cluster, values.namespace, 'networkbindings'),
          body: {
            apiVersion: API_RESOURCE_VERSION,
            kind: 'NetworkBinding',
            metadata: {
              name: buildBindingName(values.name, 'network', resourceName),
              namespace: values.namespace,
            },
            spec: {
              addressGroup: addressGroupIdentifier,
              network: {
                name: resourceName,
                namespace: values.namespace,
              },
              description: values.description,
              comment: values.comment,
            },
          },
        }),
    )

  const deleteHostBindings = currentBindings.hosts
    .filter(binding => {
      const resourceName = binding.spec?.host?.name

      if (!resourceName || !binding.metadata.name) {
        return false
      }

      return !requestedHosts.has(resourceName)
    })
    .map(
      binding => () =>
        deleteEntry({
          endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'hostbindings')}/${
            binding.metadata.name
          }`,
        }),
    )

  const deleteServiceBindings = currentBindings.services
    .filter(binding => {
      const resourceKey = getBindingLookupKey(binding.spec?.service)

      if (!resourceKey || !binding.metadata.name) {
        return false
      }

      return !requestedServices.has(resourceKey)
    })
    .map(
      binding => () =>
        deleteEntry({
          endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'servicebindings')}/${
            binding.metadata.name
          }`,
        }),
    )

  const deleteNetworkBindings = currentBindings.networks
    .filter(binding => {
      const resourceName = binding.spec?.network?.name

      if (!resourceName || !binding.metadata.name) {
        return false
      }

      return !requestedNetworks.has(resourceName)
    })
    .map(
      binding => () =>
        deleteEntry({
          endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'networkbindings')}/${
            binding.metadata.name
          }`,
        }),
    )

  const requests = [
    ...createHostBindings,
    ...createServiceBindings,
    ...createNetworkBindings,
    ...deleteHostBindings,
    ...deleteServiceBindings,
    ...deleteNetworkBindings,
  ]

  return runSequentialRequests(requests)
}
