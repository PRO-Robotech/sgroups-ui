import { TServiceTransport } from '../../tableConfig'

export type TServiceFormTransportEntry = {
  IPv?: TServiceTransport['IPv']
  protocol?: TServiceTransport['protocol']
  ports?: string
  types?: string[]
  description?: string
  comment?: string
}

const normalizeOptionalString = (value?: string) => {
  const trimmedValue = value?.trim()

  return trimmedValue || undefined
}

const parseTypeValues = (values?: string[]) => {
  const parsedValues = (values || [])
    .map(value => Number(String(value).trim()))
    .filter(value => Number.isInteger(value))

  return parsedValues.length > 0 ? parsedValues : undefined
}

export const flattenServiceTransports = (transports?: TServiceTransport[]): TServiceFormTransportEntry[] =>
  (transports || []).flatMap(transport => {
    const normalizedEntries = transport.entries && transport.entries.length > 0 ? transport.entries : [{}]

    return normalizedEntries.map(entry => ({
      IPv: transport.IPv,
      protocol: transport.protocol,
      ports: entry.ports,
      types: entry.types?.map(value => String(value)),
      description: entry.description,
      comment: entry.comment,
    }))
  })

export const buildServiceTransports = (entries?: TServiceFormTransportEntry[]): TServiceTransport[] => {
  const transportMap = new Map<string, TServiceTransport>()

  ;(entries || []).forEach(entry => {
    if (!entry.protocol || !entry.IPv) {
      return
    }

    const transportKey = `${entry.protocol}::${entry.IPv}`
    const currentTransport = transportMap.get(transportKey) || {
      protocol: entry.protocol,
      IPv: entry.IPv,
      entries: [],
    }

    const nextEntry =
      entry.protocol === 'ICMP'
        ? {
            description: normalizeOptionalString(entry.description),
            comment: normalizeOptionalString(entry.comment),
            types: parseTypeValues(entry.types),
          }
        : {
            description: normalizeOptionalString(entry.description),
            comment: normalizeOptionalString(entry.comment),
            ports: normalizeOptionalString(entry.ports),
          }

    currentTransport.entries = [...(currentTransport.entries || []), nextEntry]
    transportMap.set(transportKey, currentTransport)
  })

  return [...transportMap.values()].map(transport => ({
    ...transport,
    entries: (transport.entries || []).map(entry =>
      Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined)),
    ),
  }))
}

export const normalizeServiceTransports = (transports?: TServiceTransport[]) =>
  buildServiceTransports(flattenServiceTransports(transports))
