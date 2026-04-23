import type { TreeDataNode } from 'antd'
import {
  createNewEntry,
  deleteEntry,
  patchEntryWithDeleteOp,
  patchEntryWithReplaceOp,
} from '@prorobotech/openapi-k8s-toolkit'
import { buildAddressGroupContentsTree } from 'components/organisms/AddressGroups/molecules/VerboseAddressGroupPanel/contentsTree'
import {
  TAddressGroupResource,
  THostBindingResource,
  THostResource,
  TNetworkBindingResource,
  TNetworkResource,
  TServiceBindingResource,
  TServiceResource,
} from 'localTypes'
import {
  API_RESOURCE_VERSION,
  buildNamespacedValue,
  getApiEndpoint,
  getBindingLookupKey,
  normalizeOptionalString,
  parseNamespacedValue,
  renderBadgeWithValue,
  sanitizeBindingName,
} from 'utils'
import { Styled } from './styled'
import { THostFormValues } from './types'

const buildBindingName = (hostName: string, addressGroupNamespace: string, addressGroupName: string) =>
  sanitizeBindingName(`${hostName}-ag-${addressGroupNamespace}-${addressGroupName}`)

const renderOverviewTitle = (addressGroup?: TAddressGroupResource, value?: string, bindingsCount?: number) => {
  const parsedValue = value ? parseNamespacedValue(value) : undefined
  const displayName = addressGroup?.spec?.displayName || addressGroup?.metadata.name || parsedValue?.name || 'Unknown'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {renderBadgeWithValue('Address Group', displayName)}
      <Styled.Count>{bindingsCount || 0}</Styled.Count>
    </span>
  )
}

const isSameHost = (resource: THostResource | null | undefined, hostRef?: { name?: string; namespace?: string }) =>
  hostRef?.name === resource?.metadata.name && hostRef?.namespace === resource?.metadata.namespace

export const buildCurrentBindings = (host: THostResource | null | undefined, bindings?: THostBindingResource[]) =>
  (bindings || []).filter(binding => isSameHost(host, binding.spec?.host))

export const patchEditableSpec = async (endpoint: string, currentHost: THostResource, values: THostFormValues) => {
  const patchRequests: Promise<unknown>[] = []

  ;(
    [
      ['displayName', normalizeOptionalString(values.displayName)],
      ['description', normalizeOptionalString(values.description)],
      ['comment', normalizeOptionalString(values.comment)],
    ] as const
  ).forEach(([fieldName, nextValue]) => {
    const currentValue = normalizeOptionalString(currentHost.spec?.[fieldName])

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

export const syncAddressGroupBindings = async (
  cluster: string,
  hostIdentifier: { name: string; namespace: string },
  values: THostFormValues,
  currentBindings: THostBindingResource[],
) => {
  const requestedAddressGroups = new Set(values.addressGroups || [])
  const currentAddressGroups = new Set(
    currentBindings
      .map(binding => getBindingLookupKey(binding.spec?.addressGroup))
      .filter((value): value is string => Boolean(value)),
  )

  const createBindings = [...requestedAddressGroups]
    .filter(resourceValue => !currentAddressGroups.has(resourceValue))
    .map(resourceValue => {
      const addressGroup = parseNamespacedValue(resourceValue)

      return createNewEntry({
        endpoint: getApiEndpoint(cluster, values.namespace, 'hostbindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'HostBinding',
          metadata: {
            name: buildBindingName(values.name, addressGroup.namespace || '', addressGroup.name || ''),
            namespace: values.namespace,
          },
          spec: {
            addressGroup,
            host: hostIdentifier,
            description: values.description,
            comment: values.comment,
          },
        },
      })
    })

  const deleteBindings = currentBindings
    .filter(binding => {
      const addressGroupValue = getBindingLookupKey(binding.spec?.addressGroup)

      if (!addressGroupValue || !binding.metadata.name) {
        return false
      }

      return !requestedAddressGroups.has(addressGroupValue)
    })
    .map(binding =>
      deleteEntry({
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'hostbindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const requests = [...createBindings, ...deleteBindings]

  await Promise.all(requests)

  return requests.length
}

export const buildOverviewTreeData = ({
  addressGroups,
  selectedAddressGroupValues,
  hostBindings,
  networkBindings,
  serviceBindings,
  hosts,
  networks,
  services,
}: {
  addressGroups?: TAddressGroupResource[]
  selectedAddressGroupValues: string[]
  hostBindings?: THostBindingResource[]
  networkBindings?: TNetworkBindingResource[]
  serviceBindings?: TServiceBindingResource[]
  hosts?: THostResource[]
  networks?: TNetworkResource[]
  services?: TServiceResource[]
}): TreeDataNode[] => {
  const addressGroupsByKey = Object.fromEntries(
    (addressGroups || []).map(addressGroup => [
      buildNamespacedValue({
        namespace: addressGroup.metadata.namespace,
        name: addressGroup.metadata.name,
      }),
      addressGroup,
    ]),
  )

  return selectedAddressGroupValues.map(selectedValue => {
    const parsedValue = parseNamespacedValue(selectedValue)
    const addressGroup = addressGroupsByKey[selectedValue]
    const relatedHostBindings = (hostBindings || []).filter(
      binding => buildNamespacedValue(binding.spec?.addressGroup) === selectedValue,
    )
    const relatedNetworkBindings = (networkBindings || []).filter(
      binding => buildNamespacedValue(binding.spec?.addressGroup) === selectedValue,
    )
    const relatedServiceBindings = (serviceBindings || []).filter(
      binding => buildNamespacedValue(binding.spec?.addressGroup) === selectedValue,
    )

    const branches = buildAddressGroupContentsTree({
      addressGroupName: parsedValue.name || '',
      addressGroupNamespace: parsedValue.namespace || '',
      hostBindings: relatedHostBindings,
      networkBindings: relatedNetworkBindings,
      serviceBindings: relatedServiceBindings,
      hosts,
      networks,
      services,
    })

    return {
      title: renderOverviewTitle(
        addressGroup,
        selectedValue,
        relatedHostBindings.length + relatedNetworkBindings.length + relatedServiceBindings.length,
      ),
      key: `overview-${selectedValue}`,
      children: branches,
    }
  })
}
