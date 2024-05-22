import {
  TSgSgRule,
  TSgSgIcmpRule,
  TSgSgIeRule,
  TSgSgIeIcmpRule,
  TSgFqdnRule,
  TSgCidrRule,
  TSgCidrIcmpRule,
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
  TComposedForSubmitRules,
} from 'localTypes/rules'
import { STATUSES } from 'constants/rules'
import { mergePorts, findPortsInPortsArr } from './portUtils'
import {
  findSgSgRuleInResultArr,
  findSgSgIcmpRuleInResultArr,
  findSgSgIeRuleInResultArr,
  findSgSgIeIcmpRuleInResultArr,
  findSgFqdnRuleInResultArr,
  findSgCidrRuleInResultArr,
  findSgCidrIcmpRuleInResultArr,
} from './findRuleInArr'

export const composeAllTypesOfSgSgRules = (
  centerSg: string,
  rulesSgFrom: TFormSgSgRule[],
  rulesSgTo: TFormSgSgRule[],
): TComposedForSubmitRules<TSgSgRule> => {
  const result: TComposedForSubmitRules<TSgSgRule> = {
    rules: [],
    rulesToDelete: [],
  }

  rulesSgFrom.forEach(({ sg, portsSource, portsDestination, transport, logs, formChanges, action, prioritySome }) => {
    const rule = {
      sgFrom: sg,
      sgTo: centerSg,
      logs: !!logs,
      transport,
      ports:
        (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
          ? [{ s: portsSource, d: portsDestination }]
          : [],
      action,
      priority: prioritySome ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgSgRuleInResultArr(rule, result.rules)
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
      const ruleInRulesArr = findSgSgRuleInResultArr(rule, result.rulesToDelete)
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
    .forEach(({ sg, portsSource, portsDestination, transport, logs, formChanges, action, prioritySome }) => {
      const rule = {
        sgFrom: centerSg,
        sgTo: sg,
        logs: !!logs,
        transport,
        ports:
          (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
            ? [{ s: portsSource, d: portsDestination }]
            : [],
        action,
        priority: prioritySome ? { some: prioritySome } : undefined,
      }
      if (formChanges?.status !== STATUSES.deleted) {
        const ruleInRulesArr = findSgSgRuleInResultArr(rule, result.rules)
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
        const ruleInRulesArr = findSgSgRuleInResultArr(rule, result.rulesToDelete)
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

export const composeAllTypesOfSgSgIcmpRules = (
  centerSg: string,
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[],
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[],
): TComposedForSubmitRules<TSgSgIcmpRule> => {
  const result: TComposedForSubmitRules<TSgSgIcmpRule> = {
    rules: [],
    rulesToDelete: [],
  }

  rulesSgSgIcmpFrom.forEach(({ sg, IPv, types, trace, logs, formChanges, action, prioritySome }) => {
    const rule: TSgSgIcmpRule = {
      SgFrom: sg,
      SgTo: centerSg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome ? { some: prioritySome } : undefined,
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

  rulesSgSgIcmpTo.forEach(({ sg, IPv, types, trace, logs, formChanges, action, prioritySome }) => {
    const rule = {
      SgFrom: centerSg,
      SgTo: sg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome ? { some: prioritySome } : undefined,
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

export const composeAllTypesOfSgSgIeRules = (
  centerSg: string,
  rulesSgSgIeFrom: TFormSgSgIeRule[],
  rulesSgSgIeTo: TFormSgSgIeRule[],
): TComposedForSubmitRules<TSgSgIeRule> => {
  const result: TComposedForSubmitRules<TSgSgIeRule> = {
    rules: [],
    rulesToDelete: [],
  }

  const sgSgIeRules = [...rulesSgSgIeFrom, ...rulesSgSgIeTo]
  sgSgIeRules.forEach(
    ({ sg, portsSource, portsDestination, transport, logs, trace, traffic, formChanges, action, prioritySome }) => {
      const rule = {
        SgLocal: centerSg,
        Sg: sg,
        logs: !!logs,
        trace: !!trace,
        transport,
        traffic,
        ports:
          (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
            ? [{ s: portsSource, d: portsDestination }]
            : [],
        action,
        priority: prioritySome ? { some: prioritySome } : undefined,
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
    },
  )

  return result
}

export const composeAllTypesOfSgSgIeIcmpRules = (
  centerSg: string,
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[],
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[],
): TComposedForSubmitRules<TSgSgIeIcmpRule> => {
  const result: TComposedForSubmitRules<TSgSgIeIcmpRule> = {
    rules: [],
    rulesToDelete: [],
  }

  const sgSgIeIcmpRules = [...rulesSgSgIeIcmpFrom, ...rulesSgSgIeIcmpTo]
  sgSgIeIcmpRules.forEach(({ sg, IPv, types, logs, trace, traffic, formChanges, action, prioritySome }) => {
    const rule = {
      SgLocal: centerSg,
      Sg: sg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      traffic,
      action,
      priority: prioritySome ? { some: prioritySome } : undefined,
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

export const composeAllTypesOfSgFqdnRules = (
  centerSg: string,
  rulesSgFqdnTo: TFormSgFqdnRule[],
): TComposedForSubmitRules<TSgFqdnRule> => {
  const result: TComposedForSubmitRules<TSgFqdnRule> = {
    rules: [],
    rulesToDelete: [],
  }

  rulesSgFqdnTo.forEach(
    ({ fqdn, portsSource, portsDestination, transport, logs, formChanges, action, prioritySome }) => {
      const rule = {
        FQDN: fqdn,
        sgFrom: centerSg,
        logs: !!logs,
        transport,
        ports:
          (portsSource && portsSource.length > 0) || (portsDestination && portsDestination.length > 0)
            ? [{ s: portsSource, d: portsDestination }]
            : [],
        action,
        priority: prioritySome ? { some: prioritySome } : undefined,
      }
      if (formChanges?.status !== STATUSES.deleted) {
        const ruleInRulesArr = findSgFqdnRuleInResultArr(rule, result.rules)
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
        const ruleInRulesArr = findSgFqdnRuleInResultArr(rule, result.rulesToDelete)
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
    },
  )

  return result
}

export const composeAllTypesOfSgCidrRules = (
  centerSg: string,
  rulesCidrSgFrom: TFormSgCidrRule[],
  rulesCidrSgTo: TFormSgCidrRule[],
): TComposedForSubmitRules<TSgCidrRule> => {
  const result: TComposedForSubmitRules<TSgCidrRule> = {
    rules: [],
    rulesToDelete: [],
  }

  const sgCidrRules = [...rulesCidrSgFrom, ...rulesCidrSgTo]
  sgCidrRules.forEach(
    ({ cidr, portsSource, portsDestination, transport, logs, trace, traffic, formChanges, action, prioritySome }) => {
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
        action,
        priority: prioritySome ? { some: prioritySome } : undefined,
      }
      if (formChanges?.status !== STATUSES.deleted) {
        const ruleInRulesArr = findSgCidrRuleInResultArr(rule, result.rules)
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
        const ruleInRulesArr = findSgCidrRuleInResultArr(rule, result.rulesToDelete)
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
    },
  )

  return result
}

export const composeAllTypesOfSgCidrIcmpRules = (
  centerSg: string,
  rulesCidrSgIcmpFrom: TFormSgCidrIcmpRule[],
  rulesCidrSgIcmpTo: TFormSgCidrIcmpRule[],
): TComposedForSubmitRules<TSgCidrIcmpRule> => {
  const result: TComposedForSubmitRules<TSgCidrIcmpRule> = {
    rules: [],
    rulesToDelete: [],
  }

  const sgCidrIcmpRules = [...rulesCidrSgIcmpFrom, ...rulesCidrSgIcmpTo]
  sgCidrIcmpRules.forEach(({ cidr, IPv, types, logs, trace, traffic, formChanges, action, prioritySome }) => {
    const rule = {
      SG: centerSg,
      CIDR: cidr,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      traffic,
      action,
      priority: prioritySome ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      const ruleInRulesArr = findSgCidrIcmpRuleInResultArr(rule, result.rules)
      if (!ruleInRulesArr) {
        result.rules.push(rule)
      }
    } else {
      const ruleInRulesArr = findSgCidrIcmpRuleInResultArr(rule, result.rulesToDelete)
      if (!ruleInRulesArr) {
        result.rulesToDelete.push(rule)
      }
    }
  })

  return result
}
