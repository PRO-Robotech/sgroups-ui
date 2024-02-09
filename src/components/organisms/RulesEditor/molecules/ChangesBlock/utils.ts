import {
  TPortGroup,
  TSgRule,
  TFqdnRule,
  TCidrRule,
  TSgSgIcmpRule,
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TComposedForSubmitSgRules,
  TComposedForSubmitFqdnRules,
  TComposedForSubmitCidrRules,
  TComposedForSubmitSgSgIcmpRules,
} from 'localTypes/rules'
import { STATUSES } from 'constants/rules'
import {
  TFormSgRuleChangesResult,
  TFormFqdnRuleChangesResult,
  TFormCidrSgRuleChangesResult,
  TFormSgSgIcmpRuleChangesResult,
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

  rulesSgFrom.forEach(({ sgs, portsSource, portsDestination, transport, logs, formChanges }) =>
    sgs.forEach(sgFrom => {
      if (formChanges?.status !== STATUSES.deleted) {
        const rule = {
          logs: !!logs,
          ports: [{ s: portsSource, d: portsDestination }],
          sgFrom,
          sgTo: centerSg,
          transport,
        }
        if (formChanges?.status !== STATUSES.deleted) {
          const ruleInRulesArr = findSgRuleInResultArr(rule, result.rules)
          if (ruleInRulesArr) {
            if (!findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports)) {
              ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
            }
          } else {
            result.rules.push(rule)
          }
        } else {
          const ruleInRulesArr = findSgRuleInResultArr(rule, result.rulesToDelete)
          if (ruleInRulesArr) {
            ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
          } else {
            result.rulesToDelete.push(rule)
          }
        }
      }
    }),
  )

  rulesSgTo
    .filter(({ sgs }) => sgs.length !== 1 && sgs[0] !== centerSg)
    .forEach(({ sgs, portsSource, portsDestination, transport, logs, formChanges }) =>
      sgs.forEach(sgTo => {
        const rule = {
          logs: !!logs,
          ports: [{ s: portsSource, d: portsDestination }],
          sgFrom: centerSg,
          sgTo,
          transport,
        }
        if (formChanges?.status !== STATUSES.deleted) {
          const ruleInRulesArr = findSgRuleInResultArr(rule, result.rules)
          if (ruleInRulesArr) {
            if (!findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports)) {
              ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
            }
          } else {
            result.rules.push(rule)
          }
        } else {
          const ruleInRulesArr = findSgRuleInResultArr(rule, result.rulesToDelete)
          if (ruleInRulesArr) {
            if (!findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports)) {
              ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
            }
          } else {
            result.rulesToDelete.push(rule)
          }
        }
      }),
    )

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

  rulesFqdnTo.forEach(({ fqdns, portsSource, portsDestination, transport, logs, formChanges }) =>
    fqdns.forEach(FQDN => {
      const rule = {
        logs: !!logs,
        ports: [{ s: portsSource, d: portsDestination }],
        FQDN,
        sgFrom: centerSg,
        transport,
      }
      if (formChanges?.status !== STATUSES.deleted) {
        const ruleInRulesArr = findFqdnRuleInResultArr(rule, result.rules)
        if (ruleInRulesArr) {
          if (!findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports)) {
            ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
          }
        } else {
          result.rules.push(rule)
        }
      } else {
        const ruleInRulesArr = findFqdnRuleInResultArr(rule, result.rulesToDelete)
        if (ruleInRulesArr) {
          if (!findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports)) {
            ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
          }
        } else {
          result.rulesToDelete.push(rule)
        }
      }
    }),
  )

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
      logs: !!logs,
      ports: [{ s: portsSource, d: portsDestination }],
      CIDR: cidr,
      SG: centerSg,
      transport,
      trace: !!trace,
      traffic,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findCidrSgRuleInResultArr(rule, result.rules)
      if (ruleInRulesArr) {
        if (!findPortsInPortsArr({ s: portsSource, d: portsDestination }, ruleInRulesArr.ports)) {
          ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
        }
      } else {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findCidrSgRuleInResultArr(rule, result.rulesToDelete)
      if (ruleInRulesArr) {
        ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
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

  rulesSgSgIcmpFrom.forEach(({ sg, ICMP, trace, logs, formChanges }) => {
    if (formChanges?.status !== STATUSES.deleted) {
      const rule: TSgSgIcmpRule = {
        SgFrom: sg,
        SgTo: centerSg,
        ICMP,
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
    }
  })

  rulesSgSgIcmpTo.forEach(({ sg, ICMP, trace, logs, formChanges }) => {
    if (formChanges?.status !== STATUSES.deleted) {
      const rule = {
        SgFrom: centerSg,
        SgTo: sg,
        ICMP,
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
    }
  })

  return result
}
