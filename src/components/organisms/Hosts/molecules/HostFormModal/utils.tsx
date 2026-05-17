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
  groupTreeDataByNamespace,
  normalizeOptionalString,
  parseNamespacedValue,
  renderBadgeWithValue,
  runSequentialRequests,
  sanitizeBindingName,
} from 'utils'
import { Styled } from './styled'
import { THostFormValues } from './types'

const buildBindingName = (hostName: string, addressGroupNamespace: string, addressGroupName: string) =>
  sanitizeBindingName(`${hostName}-ag-${addressGroupNamespace}-${addressGroupName}`)

const renderOverviewTitle = (
  addressGroup?: TAddressGroupResource,
  value?: string,
  bindingsCount?: number,
  isNew?: boolean,
) => {
  const parsedValue = value ? parseNamespacedValue(value) : undefined
  const displayName = addressGroup?.spec?.displayName || addressGroup?.metadata.name || parsedValue?.name || 'Unknown'

  const title = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {renderBadgeWithValue('AddressGroup', displayName)}
      <Styled.Count>{bindingsCount || 0}</Styled.Count>
    </span>
  )

  return isNew ? <Styled.NewHighlight>{title}</Styled.NewHighlight> : title
}

const isSameHostBinding = (resource: THostResource | null | undefined, binding: THostBindingResource) => {
  const hostRef = binding.spec?.host
  const hostNamespace = hostRef?.namespace || binding.metadata.namespace

  return hostRef?.name === resource?.metadata.name && hostNamespace === resource?.metadata.namespace
}

export const buildCurrentBindings = (host: THostResource | null | undefined, bindings?: THostBindingResource[]) =>
  (bindings || []).filter(binding => isSameHostBinding(host, binding))

export const patchEditableSpec = async (endpoint: string, currentHost: THostResource, values: THostFormValues) => {
  const patchRequests: Array<() => Promise<unknown>> = []

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

      return () =>
        createNewEntry({
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
    .map(
      binding => () =>
        deleteEntry({
          endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'hostbindings')}/${
            binding.metadata.name
          }`,
        }),
    )

  const requests = [...createBindings, ...deleteBindings]

  return runSequentialRequests(requests)
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
  currentHost,
  addedAddressGroupValues = [],
}: {
  addressGroups?: TAddressGroupResource[]
  selectedAddressGroupValues: string[]
  hostBindings?: THostBindingResource[]
  networkBindings?: TNetworkBindingResource[]
  serviceBindings?: TServiceBindingResource[]
  hosts?: THostResource[]
  networks?: TNetworkResource[]
  services?: TServiceResource[]
  currentHost?: THostResource | null
  addedAddressGroupValues?: string[]
}): TreeDataNode[] => {
  const addedAddressGroups = new Set(addedAddressGroupValues)
  const highlightedHostValue = buildNamespacedValue(currentHost?.metadata)
  const addressGroupsByKey = Object.fromEntries(
    (addressGroups || []).map(addressGroup => [
      buildNamespacedValue({
        namespace: addressGroup.metadata.namespace,
        name: addressGroup.metadata.name,
      }),
      addressGroup,
    ]),
  )

  const addressGroupNodes = selectedAddressGroupValues.map(selectedValue => {
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
    const nextHostBindings =
      currentHost && addedAddressGroups.has(selectedValue)
        ? [
            ...relatedHostBindings,
            {
              metadata: {
                name: `pending-${currentHost.metadata.namespace || 'all'}-${currentHost.metadata.name || 'host'}`,
                namespace: currentHost.metadata.namespace,
              },
              spec: {
                addressGroup: parsedValue,
                host: {
                  name: currentHost.metadata.name,
                  namespace: currentHost.metadata.namespace,
                },
              },
            } as THostBindingResource,
          ]
        : relatedHostBindings

    const branches = buildAddressGroupContentsTree({
      addressGroupName: parsedValue.name || '',
      addressGroupNamespace: parsedValue.namespace || '',
      keyPrefix: `overview-${selectedValue}`,
      hostBindings: nextHostBindings,
      networkBindings: relatedNetworkBindings,
      serviceBindings: relatedServiceBindings,
      hosts,
      networks,
      services,
      highlightedHosts: highlightedHostValue && addedAddressGroups.has(selectedValue) ? [highlightedHostValue] : [],
    })

    return {
      namespace: addressGroup?.metadata.namespace || parsedValue.namespace,
      node: {
        title: renderOverviewTitle(
          addressGroup,
          selectedValue,
          nextHostBindings.length + relatedNetworkBindings.length + relatedServiceBindings.length,
          addedAddressGroups.has(selectedValue),
        ),
        key: `overview-${selectedValue}`,
        children: branches,
      },
    }
  })

  return groupTreeDataByNamespace(addressGroupNodes, 'overview')
}
