import {
  createNewEntry,
  deleteEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
} from '@prorobotech/openapi-k8s-toolkit'
import { TAddressGroupResource } from 'components/organisms/AddressGroups/tableConfig'
import { THostBindingResource, TNetworkBindingResource, TServiceBindingResource } from 'localTypes'
import { renderBadgeWithValue } from 'utils'
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

export const getResourceOptions = (kind: 'Host' | 'Network', items?: TSelectableResource[]): TResourceOption[] =>
  (items || [])
    .map(item => item.metadata.name)
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => first.localeCompare(second))
    .map(value => ({
      value,
      label: renderResourceOptionLabel(kind, value),
      searchText: value,
    }))

export const getNamespacedResourceOptions = (items?: TSelectableResource[]): TResourceOption[] =>
  (items || [])
    .reduce<TResourceOption[]>((acc, item) => {
      const { name, namespace: resourceNamespace } = item.metadata

      if (!name || !resourceNamespace) {
        return acc
      }

      acc.push({
        value: `${resourceNamespace}/${name}`,
        label: renderResourceOptionLabel('Service', `${resourceNamespace} / ${name}`),
        searchText: `${resourceNamespace} ${name}`,
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

export const patchEditableSpec = async (
  endpoint: string,
  addressGroup: TAddressGroupResource,
  values: TAddressGroupFormValues,
) => {
  const patchRequests: Promise<unknown>[] = []
  const nextDefaultAction = values.allowAccess ? 'Allow' : 'Deny'
  const currentDefaultAction = addressGroup.spec?.defaultAction || 'Deny'

  if (nextDefaultAction !== currentDefaultAction) {
    patchRequests.push(
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
      patchRequests.push(
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: `/spec/${fieldName}`,
        }),
      )
      return
    }

    patchRequests.push(
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: `/spec/${fieldName}`,
        body: nextValue,
      }),
    )
  })

  await Promise.all(patchRequests)

  return patchRequests.length
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
    .map(resourceName =>
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

      return createNewEntry({
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
    .map(resourceName =>
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
    .map(binding =>
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
    .map(binding =>
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
    .map(binding =>
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

  await Promise.all(requests)

  return requests.length
}
