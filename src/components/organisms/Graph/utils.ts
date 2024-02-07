/* eslint-disable camelcase */
import { TEntry, TFilter } from 'localTypes/graph'
import { TSgRule } from 'localTypes/rules'
import { TSecurityGroup } from 'localTypes/securityGroups'

const findNetworksBySg = (sg: string, sgs: TSecurityGroup[]): string[] => {
  const networks = sgs.find(el => el.name === sg)?.networks
  if (networks) {
    return networks
  }
  return []
}

export const mapRulesAndSgToEntries = (rules: TSgRule[], sgs: TSecurityGroup[]): TEntry[] => {
  const result: TEntry[] = []
  rules.forEach(({ sgFrom, sgTo, transport, ports }) => {
    const networksFrom = findNetworksBySg(sgFrom, sgs)
    const networksTo = findNetworksBySg(sgTo, sgs)
    networksFrom.forEach(sourceNw => {
      networksTo.forEach(destinationNw => {
        ports.forEach(({ s, d }) => {
          const sourcePorts = s === '' ? ['any'] : s.split(',')
          const destinationPorts = d === '' ? ['any'] : d.split(',')
          sourcePorts.forEach(sourcePort => {
            destinationPorts.forEach(destinationPort => {
              result.push({
                uuid: sgFrom + sgTo,
                src_ip: sourceNw,
                src_port: sourcePort,
                dst_ip: destinationNw,
                dst_port: destinationPort,
                protocol: transport,
                from: sgFrom,
                to: sgTo,
              })
            })
          })
        })
      })
    })
  })
  return result
}

export const filterData = (data: TEntry[], filters: TFilter | undefined): TEntry[] => {
  let result: TEntry[] = data

  if (filters) {
    ;(Object.keys(filters) as (keyof typeof filters)[]).forEach((key: keyof typeof filters) => {
      if (filters[key]) {
        result = result.filter(el => el[key] === filters[key])
      }
    })
    return result
  }

  return result
}

export const filterForSelected = (data: TEntry[], selectedSg: string[], selectedNW?: string): TEntry[] => {
  let result: TEntry[] = data
  const filteredSelected = selectedSg.filter(el => el)

  if (filteredSelected.length === 0) {
    return data
  }
  if (filteredSelected.length === 1) {
    return data.filter(el => el.from === selectedSg[0] || el.to === selectedSg[0])
  }
  if (selectedNW) {
    result = result.filter(({ src_ip, dst_ip }) => src_ip === selectedNW || dst_ip === selectedNW)
  }
  return result.filter(
    el =>
      (el.from === selectedSg[0] && el.to === selectedSg[1]) || (el.from === selectedSg[1] && el.to === selectedSg[0]),
  )
}
