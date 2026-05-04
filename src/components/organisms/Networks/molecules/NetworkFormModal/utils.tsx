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
  renderNamespacedResourceValue,
  runSequentialRequests,
  sanitizeBindingName,
} from 'utils'
import { Styled } from './styled'
import { TNetworkFormValues } from './types'

const buildBindingName = (networkName: string, addressGroupNamespace: string, addressGroupName: string) =>
  sanitizeBindingName(`${networkName}-ag-${addressGroupNamespace}-${addressGroupName}`)

const renderOverviewTitle = (
  addressGroup?: TAddressGroupResource,
  value?: string,
  bindingsCount?: number,
  isNew?: boolean,
) => {
  const parsedValue = value ? parseNamespacedValue(value) : undefined
  const displayName = addressGroup?.spec?.displayName || addressGroup?.metadata.name || parsedValue?.name || 'Unknown'
  const addressGroupNamespace = addressGroup?.metadata.namespace || parsedValue?.namespace

  const title = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {renderNamespacedResourceValue('Address Group', addressGroupNamespace, displayName)}
      <Styled.Count>{bindingsCount || 0}</Styled.Count>
    </span>
  )

  return isNew ? <Styled.NewHighlight>{title}</Styled.NewHighlight> : title
}

const isSameNetwork = (
  resource: TNetworkResource | null | undefined,
  networkRef?: { name?: string; namespace?: string },
) => networkRef?.name === resource?.metadata.name && networkRef?.namespace === resource?.metadata.namespace

export const buildCurrentBindings = (
  network: TNetworkResource | null | undefined,
  bindings?: TNetworkBindingResource[],
) => (bindings || []).filter(binding => isSameNetwork(network, binding.spec?.network))

export const patchEditableSpec = async (
  endpoint: string,
  currentNetwork: TNetworkResource,
  values: TNetworkFormValues,
) => {
  const patchRequests: Array<() => Promise<unknown>> = []
  const nextCidr = values.cidr.trim()
  const currentCidr = currentNetwork.spec?.CIDR?.trim()

  if (nextCidr !== currentCidr) {
    patchRequests.push(() =>
      patchEntryWithReplaceOp({
        endpoint,
        pathToValue: '/spec/CIDR',
        body: nextCidr,
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
    const currentValue = normalizeOptionalString(currentNetwork.spec?.[fieldName])

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
  networkIdentifier: { name: string; namespace: string },
  values: TNetworkFormValues,
  currentBindings: TNetworkBindingResource[],
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
          endpoint: getApiEndpoint(cluster, values.namespace, 'networkbindings'),
          body: {
            apiVersion: API_RESOURCE_VERSION,
            kind: 'NetworkBinding',
            metadata: {
              name: buildBindingName(values.name, addressGroup.namespace || '', addressGroup.name || ''),
              namespace: values.namespace,
            },
            spec: {
              addressGroup,
              network: networkIdentifier,
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
          endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'networkbindings')}/${
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
  currentNetwork,
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
  currentNetwork?: TNetworkResource | null
  addedAddressGroupValues?: string[]
}): TreeDataNode[] => {
  const addedAddressGroups = new Set(addedAddressGroupValues)
  const highlightedNetworkValue = buildNamespacedValue(currentNetwork?.metadata)
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
    const nextNetworkBindings =
      currentNetwork && addedAddressGroups.has(selectedValue)
        ? [
            ...relatedNetworkBindings,
            {
              metadata: {
                name: `pending-${currentNetwork.metadata.namespace || 'all'}-${
                  currentNetwork.metadata.name || 'network'
                }`,
                namespace: currentNetwork.metadata.namespace,
              },
              spec: {
                addressGroup: parsedValue,
                network: {
                  name: currentNetwork.metadata.name,
                  namespace: currentNetwork.metadata.namespace,
                },
              },
            } as TNetworkBindingResource,
          ]
        : relatedNetworkBindings

    const branches = buildAddressGroupContentsTree({
      addressGroupName: parsedValue.name || '',
      addressGroupNamespace: parsedValue.namespace || '',
      keyPrefix: `overview-${selectedValue}`,
      hostBindings: relatedHostBindings,
      networkBindings: nextNetworkBindings,
      serviceBindings: relatedServiceBindings,
      hosts,
      networks,
      services,
      highlightedNetworks:
        highlightedNetworkValue && addedAddressGroups.has(selectedValue) ? [highlightedNetworkValue] : [],
    })

    return {
      title: renderOverviewTitle(
        addressGroup,
        selectedValue,
        relatedHostBindings.length + nextNetworkBindings.length + relatedServiceBindings.length,
        addedAddressGroups.has(selectedValue),
      ),
      key: `overview-${selectedValue}`,
      children: branches,
    }
  })
}
