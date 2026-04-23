import { ReactNode } from 'react'
import { TAddressGroupResource } from 'localTypes'
import { renderBadgeWithValue } from './tableFormatters'

export const API_GROUP = 'sgroups.io'
export const API_VERSION = 'v1alpha1'
export const API_RESOURCE_VERSION = `${API_GROUP}/${API_VERSION}`
export const NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
export const PORT_VALUE_SEPARATOR = /\s*,\s*/
export const FQDN_PATTERN = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i

const HEX_GROUP_PATTERN = /^[0-9a-f]{1,4}$/i

export const IPV_OPTIONS = [
  { label: 'IPv4', value: 'IPv4' },
  { label: 'IPv6', value: 'IPv6' },
] as const

export const PROTOCOL_OPTIONS = [
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' },
  { label: 'ICMP', value: 'ICMP' },
] as const

export type TResourceOption = {
  value: string
  label: ReactNode
  searchText: string
}

export type TNamespacedResource = {
  metadata: {
    name?: string
    namespace?: string
  }
  spec?: {
    displayName?: string
  }
}

export type TDeleteModalResource = {
  key: string
  name: string
  endpoint: string
}

export const getApiEndpoint = (cluster: string, namespaceValue: string, plural: string) =>
  `/api/clusters/${cluster}/k8s/apis/${API_GROUP}/${API_VERSION}/namespaces/${namespaceValue}/${plural}`

export const getDeleteModalResource = (
  cluster: string,
  fallbackNamespace: string | undefined,
  plural: string,
  resource: TNamespacedResource & { key: string },
): TDeleteModalResource | null => {
  const resourceName = resource.metadata.name
  const resourceNamespace = resource.metadata.namespace || fallbackNamespace

  if (!resourceName || !resourceNamespace) {
    return null
  }

  return {
    key: resource.key,
    name: `${resourceNamespace}/${resourceName}`,
    endpoint: `${getApiEndpoint(cluster, resourceNamespace, plural)}/${resourceName}`,
  }
}

export const compactSpec = (spec: Record<string, string | boolean | undefined>) =>
  Object.fromEntries(Object.entries(spec).filter(([, value]) => value !== undefined && value !== ''))

export const normalizeOptionalString = (value?: string) => {
  const trimmedValue = value?.trim()

  return trimmedValue || undefined
}

export const runSequentialRequests = (requests: Array<() => Promise<unknown>>) =>
  requests.reduce(
    (chain, request) =>
      chain.then(async count => {
        await request()

        return count + 1
      }),
    Promise.resolve(0),
  )

export const sanitizeBindingName = (value: string) => {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)
    .replace(/-$/g, '')

  return sanitized || 'binding'
}

export const parseNamespacedValue = (value?: string) => {
  if (!value) {
    return {}
  }

  const [resourceNamespace, ...nameParts] = value.split('/')

  return {
    namespace: resourceNamespace,
    name: nameParts.join('/'),
  }
}

export const buildNamespacedValue = (resource?: { namespace?: string; name?: string }) =>
  resource?.name && resource?.namespace ? `${resource.namespace}/${resource.name}` : undefined

export const getBindingLookupKey = (resource?: { name?: string; namespace?: string }) =>
  resource?.name ? `${resource.namespace || ''}/${resource.name}` : null

export const getNamespaceOptions = (items?: Array<{ metadata?: { name?: string } }>) =>
  (items || [])
    .map(item => item.metadata?.name)
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => first.localeCompare(second))
    .map(value => ({ value, label: value }))

export const getNamespacedResourceOptions = (
  items: TNamespacedResource[] | undefined,
  badgeLabel: 'Address Group' | 'Service',
): TResourceOption[] =>
  (items || [])
    .reduce<TResourceOption[]>((acc, item) => {
      const resourceName = item.metadata.name
      const resourceNamespace = item.metadata.namespace

      if (!resourceName || !resourceNamespace) {
        return acc
      }

      const displayValue = `${resourceNamespace} / ${item.spec?.displayName || resourceName}`
      acc.push({
        value: `${resourceNamespace}/${resourceName}`,
        label: renderBadgeWithValue(badgeLabel, displayValue),
        searchText: `${resourceNamespace} ${resourceName} ${item.spec?.displayName || ''}`.trim(),
      })

      return acc
    }, [])
    .sort((first, second) => first.searchText.localeCompare(second.searchText))

export const getAddressGroupOptions = (items?: TAddressGroupResource[]) =>
  getNamespacedResourceOptions(items, 'Address Group')

export const getScopedResourceOptions = (options: TResourceOption[], selectedNamespace?: string) =>
  selectedNamespace
    ? options
        .filter(option => option.value.startsWith(`${selectedNamespace}/`))
        .map(option => ({
          ...option,
          value: parseNamespacedValue(option.value).name || option.value,
        }))
    : []

const isValidIPv4 = (value: string) => {
  const octets = value.split('.')

  if (octets.length !== 4) {
    return false
  }

  return octets.every(octet => {
    if (!/^\d+$/.test(octet)) {
      return false
    }

    if (octet.length > 1 && octet.startsWith('0')) {
      return false
    }

    const parsedValue = Number(octet)

    return Number.isInteger(parsedValue) && parsedValue >= 0 && parsedValue <= 255
  })
}

const isValidIPv6 = (value: string) => {
  if (!value || value.includes(':::')) {
    return false
  }

  const doubleColonParts = value.split('::')

  if (doubleColonParts.length > 2) {
    return false
  }

  const parseGroups = (part: string) => {
    if (!part) {
      return []
    }

    return part.split(':')
  }

  const leftGroups = parseGroups(doubleColonParts[0])
  const rightGroups = parseGroups(doubleColonParts[1] || '')
  const allGroups = [...leftGroups, ...rightGroups]

  if (allGroups.some(group => !HEX_GROUP_PATTERN.test(group))) {
    return false
  }

  if (doubleColonParts.length === 1) {
    return allGroups.length === 8
  }

  return allGroups.length < 8
}

export const validateCIDR = (value?: string) => {
  const normalizedValue = normalizeOptionalString(value)

  if (!normalizedValue) {
    return false
  }

  const separatorIndex = normalizedValue.lastIndexOf('/')

  if (separatorIndex <= 0 || separatorIndex === normalizedValue.length - 1) {
    return false
  }

  const addressPart = normalizedValue.slice(0, separatorIndex)
  const prefixPart = normalizedValue.slice(separatorIndex + 1)

  if (!/^\d+$/.test(prefixPart)) {
    return false
  }

  const prefix = Number(prefixPart)

  if (addressPart.includes('.')) {
    return isValidIPv4(addressPart) && prefix >= 0 && prefix <= 32
  }

  if (addressPart.includes(':')) {
    return isValidIPv6(addressPart) && prefix >= 0 && prefix <= 128
  }

  return false
}

export const validatePortToken = (value: string) => {
  if (!value) {
    return false
  }

  const rangeMatch = value.match(/^(\d+)-(\d+)$/)

  if (rangeMatch) {
    const rangeStart = Number(rangeMatch[1])
    const rangeEnd = Number(rangeMatch[2])

    return (
      Number.isInteger(rangeStart) &&
      Number.isInteger(rangeEnd) &&
      rangeStart >= 1 &&
      rangeStart <= 65535 &&
      rangeEnd >= 1 &&
      rangeEnd <= 65535 &&
      rangeStart <= rangeEnd
    )
  }

  const port = Number(value)

  return Number.isInteger(port) && port >= 1 && port <= 65535
}
