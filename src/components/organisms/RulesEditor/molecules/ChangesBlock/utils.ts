import {
  TSgRule,
  TFqdnRule,
  TCidrRule,
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TComposedForSubmitSgRules,
  TComposedForSubmitFqdnRules,
  TComposedForSubmitCidrRules,
} from 'localTypes/rules'
import { STATUSES } from 'constants/rules'
import { TFormSgRuleChangesResult, TFormFqdnRuleChangesResult, TFormCidrSgRuleChangesResult } from './types'

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
            ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
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

  rulesSgTo.forEach(({ sgs, portsSource, portsDestination, transport, logs, formChanges }) =>
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
          ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
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
          ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
        } else {
          result.rules.push(rule)
        }
      } else {
        const ruleInRulesArr = findFqdnRuleInResultArr(rule, result.rulesToDelete)
        if (ruleInRulesArr) {
          ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
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
        ruleInRulesArr.ports = [...ruleInRulesArr.ports, { s: portsSource, d: portsDestination }]
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
