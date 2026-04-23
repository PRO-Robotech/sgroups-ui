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
  TBindingBase,
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
import { buildServiceTransports, normalizeServiceTransports } from './transportUtils'
import { TServiceFormValues } from './types'

const buildBindingName = (serviceName: string, addressGroupNamespace: string, addressGroupName: string) =>
  sanitizeBindingName(`${serviceName}-ag-${addressGroupNamespace}-${addressGroupName}`)

const isSameService = (
  resource: TServiceResource | null | undefined,
  serviceRef?: { name?: string; namespace?: string },
) => serviceRef?.name === resource?.metadata.name && serviceRef?.namespace === resource?.metadata.namespace

const isBindingRelatedToSelectedAddressGroups = (binding: TBindingBase, selectedAddressGroupValues: string[]) => {
  const relatedValue = buildNamespacedValue(binding.spec?.addressGroup)

  return relatedValue ? selectedAddressGroupValues.includes(relatedValue) : false
}

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

export const buildCurrentBindings = (
  service: TServiceResource | null | undefined,
  serviceBindings?: TServiceBindingResource[],
) => (serviceBindings || []).filter(binding => isSameService(service, binding.spec?.service))

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
    const relatedHostBindings = (hostBindings || []).filter(binding =>
      isBindingRelatedToSelectedAddressGroups(binding, [selectedValue]),
    )
    const relatedNetworkBindings = (networkBindings || []).filter(binding =>
      isBindingRelatedToSelectedAddressGroups(binding, [selectedValue]),
    )
    const relatedServiceBindings = (serviceBindings || []).filter(binding =>
      isBindingRelatedToSelectedAddressGroups(binding, [selectedValue]),
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

export const patchEditableSpec = async (endpoint: string, service: TServiceResource, values: TServiceFormValues) => {
  const patchRequests: Promise<unknown>[] = []

  ;(
    [
      ['displayName', normalizeOptionalString(values.displayName)],
      ['description', normalizeOptionalString(values.description)],
      ['comment', normalizeOptionalString(values.comment)],
    ] as const
  ).forEach(([fieldName, nextValue]) => {
    const currentValue = normalizeOptionalString(service.spec?.[fieldName])

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

  const nextTransports = buildServiceTransports(values.transportEntries)
  const currentTransports = normalizeServiceTransports(service.spec?.transports)

  if (JSON.stringify(nextTransports) !== JSON.stringify(currentTransports)) {
    if (nextTransports.length === 0) {
      patchRequests.push(
        patchEntryWithDeleteOp({
          endpoint,
          pathToValue: '/spec/transports',
        }),
      )
    } else {
      patchRequests.push(
        patchEntryWithReplaceOp({
          endpoint,
          pathToValue: '/spec/transports',
          body: nextTransports,
        }),
      )
    }
  }

  await Promise.all(patchRequests)

  return patchRequests.length
}

export const syncAddressGroupBindings = async (
  cluster: string,
  serviceIdentifier: { name: string; namespace: string },
  values: TServiceFormValues,
  currentBindings: TServiceBindingResource[],
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
        endpoint: getApiEndpoint(cluster, values.namespace, 'servicebindings'),
        body: {
          apiVersion: API_RESOURCE_VERSION,
          kind: 'ServiceBinding',
          metadata: {
            name: buildBindingName(values.name, addressGroup.namespace || '', addressGroup.name || ''),
            namespace: values.namespace,
          },
          spec: {
            addressGroup,
            service: serviceIdentifier,
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
        endpoint: `${getApiEndpoint(cluster, binding.metadata.namespace || values.namespace, 'servicebindings')}/${
          binding.metadata.name
        }`,
      }),
    )

  const requests = [...createBindings, ...deleteBindings]

  await Promise.all(requests)

  return requests.length
}
