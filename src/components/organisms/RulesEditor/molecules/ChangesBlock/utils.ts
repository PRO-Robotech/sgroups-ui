import {
  TPortGroup,
  TSgRule,
  TFqdnRule,
  TCidrRule,
  TSgSgIcmpRule,
  TSgSgIeRule,
  TSgSgIeIcmpRule,
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TComposedForSubmitSgRules,
  TComposedForSubmitFqdnRules,
  TComposedForSubmitCidrRules,
  TComposedForSubmitSgSgIcmpRules,
  TComposedForSubmitSgSgIeRules,
  TComposedForSubmitSgSgIeIcmpRules,
} from 'localTypes/rules'
import { STATUSES } from 'constants/rules'
import {
  TFormSgRuleChangesResult,
  TFormFqdnRuleChangesResult,
  TFormCidrSgRuleChangesResult,
  TFormSgSgIcmpRuleChangesResult,
  TFormSgSgIeRuleChangesResult,
  TFormSgSgIeIcmpRuleChangesResult,
} from './types'

export const getChangesSgRules = (rules: TFormSgRule[]): TFormSgRuleChangesResult | null => {
  const result: TFormSgRuleChangesResult = {
    newRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.new),
    diffRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.modified),
    deletedRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.deleted),
  }

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}

export const getChangesFqdnRules = (rules: TFormFqdnRule[]): TFormFqdnRuleChangesResult | null => {
  const result: TFormFqdnRuleChangesResult = {
    newRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.new),
    diffRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.modified),
    deletedRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.deleted),
  }

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}

export const getChangesCidrSgRules = (rules: TFormCidrSgRule[]): TFormCidrSgRuleChangesResult | null => {
  const result: TFormCidrSgRuleChangesResult = {
    newRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.new),
    diffRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.modified),
    deletedRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.deleted),
  }

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}

export const getChangesSgSgIcmpRules = (rules: TFormSgSgIcmpRule[]): TFormSgSgIcmpRuleChangesResult | null => {
  const result: TFormSgSgIcmpRuleChangesResult = {
    newRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.new),
    diffRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.modified),
    deletedRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.deleted),
  }

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}

export const getChangesSgSgIeRules = (rules: TFormSgSgIeRule[]): TFormSgSgIeRuleChangesResult | null => {
  const result: TFormSgSgIeRuleChangesResult = {
    newRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.new),
    diffRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.modified),
    deletedRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.deleted),
  }

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}

export const getChangesSgSgIeIcmpRules = (rules: TFormSgSgIeIcmpRule[]): TFormSgSgIeIcmpRuleChangesResult | null => {
  const result: TFormSgSgIeIcmpRuleChangesResult = {
    newRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.new),
    diffRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.modified),
    deletedRules: rules.filter(({ formChanges }) => formChanges?.status === STATUSES.deleted),
  }

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}

const checkIfPortRangeIncludesPort = (portRange: string, port?: string): boolean => {
  if (port) {
    const [portRangeStart, portRangeEnd] = portRange.split('-')
    if (port >= portRangeStart && port <= portRangeEnd) {
      return true
    }
  }
  return false
}

const mergeTwoRanges = (portRange: string, portRangeSecond: string): string => {
  const [portRangeStartString, portRangeEndString] = portRange.split('-')
  const [portRangeSecondStartString, portRangeSecondEndString] = portRangeSecond.split('-')
  const portRangeStart = Number(portRangeStartString)
  const portRangeEnd = Number(portRangeEndString)
  const portRangeSecondStart = Number(portRangeSecondStartString)
  const portRangeSecondEnd = Number(portRangeSecondEndString)
  // second inside first
  if (portRangeSecondStart >= portRangeStart && portRangeSecondEnd <= portRangeEnd) {
    return `${portRangeStart}-${portRangeEnd}`
  }
  // first inside second
  if (portRangeStart >= portRangeSecondStart && portRangeEnd <= portRangeSecondEnd) {
    return `${portRangeSecondStart}-${portRangeSecondEnd}`
  }
  // overlap
  if (
    portRangeSecondStart >= portRangeStart &&
    portRangeSecondStart < portRangeEnd &&
    portRangeSecondEnd >= portRangeEnd
  ) {
    return `${portRangeStart}-${portRangeSecondEnd}`
  }
  // overlap otherside
  if (
    portRangeSecondEnd >= portRangeStart &&
    portRangeSecondEnd < portRangeEnd &&
    portRangeSecondStart <= portRangeStart
  ) {
    return `${portRangeSecondStart}-${portRangeEnd}`
  }
  // no overlap
  return `${portRangeStart}-${portRangeEnd},${portRangeSecondStart}-${portRangeSecondEnd}`
}

const replacePortInPortsString = (port: string, searchText: string, portsString: string) =>
  portsString.replace(searchText, port)

const addPortInPortsString = (port: string, portsString: string) =>
  portsString.length === 0 ? port : portsString.concat(`,${port}`)

const mergePorts = (ports: TPortGroup[]): TPortGroup[] => {
  if (ports.length === 0) {
    return []
  }
  const sourceResult: TPortGroup[] = []
  const result: TPortGroup[] = []

  ports
    .map(({ s }) => s)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .forEach(s => {
      const destinationPortsForSourcePort = ports
        .filter(el => el.s === s)
        .map(({ d }) => d)
        .filter((item, index, arr) => arr.indexOf(item) === index)
      // if we have any, we just add {s, any}
      if (destinationPortsForSourcePort.includes(undefined)) {
        sourceResult.push({ s, d: undefined })
      } else {
        let destinationPortsResult = ''
        destinationPortsForSourcePort.forEach(destinationPort => {
          if (destinationPort) {
            const isIncluded = destinationPortsResult.split(',').some(el => {
              if (el.includes('-') && destinationPort.includes('-')) {
                destinationPortsResult = replacePortInPortsString(
                  mergeTwoRanges(el, destinationPort),
                  el,
                  destinationPortsResult,
                )
                return true
              }
              if (
                el.includes('-') &&
                !destinationPort.includes('-') &&
                checkIfPortRangeIncludesPort(el, destinationPort)
              ) {
                return true
              }
              if (
                destinationPort.includes('-') &&
                !el.includes('-') &&
                checkIfPortRangeIncludesPort(destinationPort, el)
              ) {
                destinationPortsResult = replacePortInPortsString(destinationPort, el, destinationPortsResult)
                return true
              }
              if (el === destinationPort) {
                return true
              }
              return false
            })
            if (!isIncluded) {
              destinationPortsResult = addPortInPortsString(destinationPort, destinationPortsResult)
            }
          }
        })
        sourceResult.push({ s, d: destinationPortsResult })
      }
    })

  sourceResult
    .map(({ d }) => d)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .forEach(d => {
      const sourcePortsForDestinationPorts = ports
        .filter(el => el.d === d)
        .map(({ s }) => s)
        .filter((item, index, arr) => arr.indexOf(item) === index)
      // if we have any, we just add {any, d}
      if (sourcePortsForDestinationPorts.includes(undefined)) {
        result.push({ s: undefined, d })
      } else {
        let sourcePortsResult = ''
        sourcePortsForDestinationPorts.forEach(sourcePort => {
          if (sourcePort) {
            const isIncluded = sourcePortsResult.split(',').some(el => {
              if (el.includes('-') && sourcePort.includes('-')) {
                sourcePortsResult = replacePortInPortsString(mergeTwoRanges(el, sourcePort), el, sourcePortsResult)
                return true
              }
              if (el.includes('-') && !sourcePort.includes('-') && checkIfPortRangeIncludesPort(el, sourcePort)) {
                return true
              }
              if (sourcePort.includes('-') && !el.includes('-') && checkIfPortRangeIncludesPort(sourcePort, el)) {
                sourcePortsResult = replacePortInPortsString(sourcePort, el, sourcePortsResult)
                return true
              }
              if (el === sourcePort) {
                return true
              }
              return false
            })
            if (!isIncluded) {
              sourcePortsResult = addPortInPortsString(sourcePort, sourcePortsResult)
            }
          }
        })
        result.push({ s: sourcePortsResult, d })
      }
    })

  return result
}

const findPortsInPortsArr = (ports: TPortGroup, portsArr: TPortGroup[]) => {
  return portsArr.some(({ s, d }) => s === ports.s && d === ports.d)
}

const findSgRuleInResultArr = (rule: TSgRule, rulesArr: TSgRule[]) => {
  return rulesArr.find(
    ({ sgFrom, sgTo, logs, transport }) =>
      sgFrom === rule.sgFrom && sgTo === rule.sgTo && logs === rule.logs && transport === rule.transport,
  )
}

export const composeAllTypesOfSgRules = (
  centerSg: string,
  rulesSgFrom: TFormSgRule[],
  rulesSgTo: TFormSgRule[],
): TComposedForSubmitSgRules => {
  const result: TComposedForSubmitSgRules = {
    rules: [],
    rulesToDelete: [],
  }

  rulesSgFrom.forEach(({ sg, portsSource, portsDestination, transport, logs, formChanges }) => {
    const rule = {
      sgFrom: sg,
      sgTo: centerSg,
      logs: !!logs,
      transport,
      ports:
        (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
          ? [{ s: portsSource, d: portsDestination }]
          : [],
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgRuleInResultArr(rule, result.rules)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findSgRuleInResultArr(rule, result.rulesToDelete)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rulesToDelete.push(rule)
      }
    }
  })

  rulesSgTo
    .filter(({ sg }) => sg !== centerSg)
    .forEach(({ sg, portsSource, portsDestination, transport, logs, formChanges }) => {
      const rule = {
        sgFrom: centerSg,
        sgTo: sg,
        logs: !!logs,
        transport,
        ports:
          (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
            ? [{ s: portsSource, d: portsDestination }]
            : [],
      }
      if (formChanges?.status !== STATUSES.deleted) {
        const ruleInRulesArr = findSgRuleInResultArr(rule, result.rules)
        if (ruleInRulesArr) {
          if (
            !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
            ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
          ) {
            ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
          }
        } else {
          result.rules.push(rule)
        }
      } else {
        const ruleInRulesArr = findSgRuleInResultArr(rule, result.rulesToDelete)
        if (ruleInRulesArr) {
          if (
            !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
            ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
          ) {
            ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
          }
        } else {
          result.rulesToDelete.push(rule)
        }
      }
    })

  return result
}

const findFqdnRuleInResultArr = (rule: TFqdnRule, rulesArr: TFqdnRule[]) => {
  return rulesArr.find(
    ({ sgFrom, FQDN, logs, transport }) =>
      sgFrom === rule.sgFrom && FQDN === rule.FQDN && logs === rule.logs && transport === rule.transport,
  )
}

export const composeAllTypesOfFqdnRules = (
  centerSg: string,
  rulesFqdnTo: TFormFqdnRule[],
): TComposedForSubmitFqdnRules => {
  const result: TComposedForSubmitFqdnRules = {
    rules: [],
    rulesToDelete: [],
  }

  rulesFqdnTo.forEach(({ fqdn, portsSource, portsDestination, transport, logs, formChanges }) => {
    const rule = {
      FQDN: fqdn,
      sgFrom: centerSg,
      logs: !!logs,
      transport,
      ports:
        (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
          ? [{ s: portsSource, d: portsDestination }]
          : [],
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findFqdnRuleInResultArr(rule, result.rules)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findFqdnRuleInResultArr(rule, result.rulesToDelete)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rulesToDelete.push(rule)
      }
    }
  })

  return result
}

const findCidrSgRuleInResultArr = (rule: TCidrRule, rulesArr: TCidrRule[]) => {
  return rulesArr.find(
    ({ CIDR, SG, logs, transport, trace, traffic }) =>
      CIDR === rule.CIDR &&
      SG === rule.SG &&
      logs === rule.logs &&
      transport === rule.transport &&
      trace === rule.trace &&
      traffic === rule.traffic,
  )
}

export const composeAllTypesOfCidrSgRules = (
  centerSg: string,
  rulesCidrSgFrom: TFormCidrSgRule[],
  rulesCidrSgTo: TFormCidrSgRule[],
): TComposedForSubmitCidrRules => {
  const result: TComposedForSubmitCidrRules = {
    rules: [],
    rulesToDelete: [],
  }

  const cidrRules = [...rulesCidrSgFrom, ...rulesCidrSgTo]
  cidrRules.forEach(({ cidr, portsSource, portsDestination, transport, logs, trace, traffic, formChanges }) => {
    const rule = {
      CIDR: cidr,
      SG: centerSg,
      logs: !!logs,
      trace: !!trace,
      transport,
      traffic,
      ports:
        (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
          ? [{ s: portsSource, d: portsDestination }]
          : [],
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findCidrSgRuleInResultArr(rule, result.rules)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findCidrSgRuleInResultArr(rule, result.rulesToDelete)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rulesToDelete.push(rule)
      }
    }
  })

  return result
}

const findSgSgIcmpRuleInResultArr = (rule: TSgSgIcmpRule, rulesArr: TSgSgIcmpRule[]) => {
  return rulesArr.find(
    ({ SgFrom, SgTo, logs, trace, ICMP }) =>
      SgFrom === rule.SgFrom &&
      SgTo === rule.SgTo &&
      logs === rule.logs &&
      trace === rule.trace &&
      ICMP.IPv === rule.ICMP.IPv &&
      JSON.stringify(ICMP.Types.sort()) === JSON.stringify(rule.ICMP.Types.sort()),
  )
}

export const composeAllTypesOfSgSgIcmpRules = (
  centerSg: string,
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[],
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[],
): TComposedForSubmitSgSgIcmpRules => {
  const result: TComposedForSubmitSgSgIcmpRules = {
    rules: [],
    rulesToDelete: [],
  }

  rulesSgSgIcmpFrom.forEach(({ sg, IPv, types, trace, logs, formChanges }) => {
    const rule: TSgSgIcmpRule = {
      SgFrom: sg,
      SgTo: centerSg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgSgIcmpRuleInResultArr(rule, result.rules)
      if (!ruleInRulesArr) {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findSgSgIcmpRuleInResultArr(rule, result.rulesToDelete)
      if (!ruleInRulesArr) {
        result.rulesToDelete.push(rule)
      }
    }
  })

  rulesSgSgIcmpTo.forEach(({ sg, IPv, types, trace, logs, formChanges }) => {
    const rule = {
      SgFrom: centerSg,
      SgTo: sg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgSgIcmpRuleInResultArr(rule, result.rules)
      if (!ruleInRulesArr) {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findSgSgIcmpRuleInResultArr(rule, result.rulesToDelete)
      if (!ruleInRulesArr) {
        result.rulesToDelete.push(rule)
      }
    }
  })

  return result
}

const findSgSgIeRuleInResultArr = (rule: TSgSgIeRule, rulesArr: TSgSgIeRule[]) => {
  return rulesArr.find(
    ({ Sg, SgLocal, logs, transport, trace, traffic }) =>
      Sg === rule.Sg &&
      SgLocal === rule.SgLocal &&
      logs === rule.logs &&
      transport === rule.transport &&
      trace === rule.trace &&
      traffic === rule.traffic,
  )
}

export const composeAllTypesOfSgSgIeRules = (
  centerSg: string,
  rulesSgSgIeFrom: TFormSgSgIeRule[],
  rulesSgSgIeTo: TFormSgSgIeRule[],
): TComposedForSubmitSgSgIeRules => {
  const result: TComposedForSubmitSgSgIeRules = {
    rules: [],
    rulesToDelete: [],
  }

  const sgSgIeRules = [...rulesSgSgIeFrom, ...rulesSgSgIeTo]
  sgSgIeRules.forEach(({ sg, portsSource, portsDestination, transport, logs, trace, traffic, formChanges }) => {
    const rule = {
      SgLocal: sg,
      Sg: centerSg,
      logs: !!logs,
      trace: !!trace,
      transport,
      traffic,
      ports:
        (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
          ? [{ s: portsSource, d: portsDestination }]
          : [],
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgSgIeRuleInResultArr(rule, result.rules)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findSgSgIeRuleInResultArr(rule, result.rulesToDelete)
      if (ruleInRulesArr) {
        if (
          !findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports) &&
          ((portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0))
        ) {
          ruleInRulesArr.ports = mergePorts([...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }])
        }
      } else {
        result.rulesToDelete.push(rule)
      }
    }
  })

  return result
}

const findSgSgIeIcmpRuleInResultArr = (rule: TSgSgIeIcmpRule, rulesArr: TSgSgIeIcmpRule[]) => {
  return rulesArr.find(
    ({ Sg, SgLocal, logs, trace, traffic, ICMP }) =>
      Sg === rule.Sg &&
      SgLocal === rule.SgLocal &&
      logs === rule.logs &&
      trace === rule.trace &&
      traffic === rule.traffic &&
      ICMP.IPv === rule.ICMP.IPv &&
      ICMP.IPv === rule.ICMP.IPv &&
      JSON.stringify(ICMP.Types.sort()) === JSON.stringify(rule.ICMP.Types.sort()),
  )
}

export const composeAllTypesOfSgSgIeIcmpRules = (
  centerSg: string,
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[],
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[],
): TComposedForSubmitSgSgIeIcmpRules => {
  const result: TComposedForSubmitSgSgIeIcmpRules = {
    rules: [],
    rulesToDelete: [],
  }

  const sgSgIeIcmpRules = [...rulesSgSgIeIcmpFrom, ...rulesSgSgIeIcmpTo]
  sgSgIeIcmpRules.forEach(({ sg, IPv, types, logs, trace, traffic, formChanges }) => {
    const rule = {
      SgLocal: sg,
      Sg: centerSg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      traffic,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgSgIeIcmpRuleInResultArr(rule, result.rules)
      if (!ruleInRulesArr) {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findSgSgIeIcmpRuleInResultArr(rule, result.rulesToDelete)
      if (!ruleInRulesArr) {
        result.rulesToDelete.push(rule)
      }
    }
  })

  return result
}
