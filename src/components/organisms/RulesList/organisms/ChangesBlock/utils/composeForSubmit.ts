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
  TPortGroup,
} from 'localTypes/rules'
import { STATUSES } from 'constants/rules'

export const composePorts = (ports: TPortGroup[] | undefined | null): TPortGroup[] | null => {
  if (!ports) {
    return null
  }
  const isAllEmpty = !ports.some(({ s, d }) => s !== undefined || d !== undefined)
  if (isAllEmpty) {
    return null
  }
  return ports.map(({ s, d }) => {
    const newS = s === undefined ? null : s
    const newD = d === undefined ? null : d
    return { s: newS, d: newD }
  })
}

export const composeAllTypesOfSgSgRules = (
  centerSg: string,
  rulesSgFrom: TFormSgSgRule[],
  rulesSgTo: TFormSgSgRule[],
): TComposedForSubmitRules<TSgSgRule> => {
  const result: TComposedForSubmitRules<TSgSgRule> = {
    rules: [],
    rulesToDelete: [],
  }

  rulesSgFrom.forEach(({ sg, ports, transport, logs, formChanges, action, prioritySome }) => {
    const rule = {
      sgFrom: sg,
      sgTo: centerSg,
      transport,
      ports: composePorts(ports),
      logs: !!logs,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz transport + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('transport')) {
        result.rulesToDelete.push({ ...rule, transport: rule.transport === 'TCP' ? 'UDP' : 'TCP' })
      }
    } else {
      result.rulesToDelete.push(rule)
    }
  })

  rulesSgTo
    .filter(({ sg }) => sg !== centerSg)
    .forEach(({ sg, ports, transport, logs, formChanges, action, prioritySome }) => {
      const rule = {
        sgFrom: centerSg,
        sgTo: sg,
        transport,
        ports: composePorts(ports),
        logs: !!logs,
        action,
        priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
      }
      if (formChanges?.status !== STATUSES.deleted) {
        result.rules.push(rule)
        /* cuz transport + sg === alt key (primary is internal on backend) */
        if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('transport')) {
          result.rulesToDelete.push({ ...rule, transport: rule.transport === 'TCP' ? 'UDP' : 'TCP' })
        }
      } else {
        result.rulesToDelete.push(rule)
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
      sgFrom: sg,
      sgTo: centerSg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz ipv + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('ipv')) {
        result.rulesToDelete.push({ ...rule, ICMP: { ...rule.ICMP, IPv: rule.ICMP.IPv === 'IPv6' ? 'IPv4' : 'IPv6' } })
      }
    } else {
      result.rulesToDelete.push(rule)
    }
  })

  rulesSgSgIcmpTo.forEach(({ sg, IPv, types, trace, logs, formChanges, action, prioritySome }) => {
    const rule = {
      sgFrom: centerSg,
      sgTo: sg,
      ICMP: { IPv, Types: types },
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz ipv + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('ipv')) {
        result.rulesToDelete.push({ ...rule, ICMP: { ...rule.ICMP, IPv: rule.ICMP.IPv === 'IPv6' ? 'IPv4' : 'IPv6' } })
      }
    } else {
      result.rulesToDelete.push(rule)
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
  sgSgIeRules.forEach(({ sg, ports, transport, logs, trace, traffic, formChanges, action, prioritySome }) => {
    const rule = {
      sgLocal: centerSg,
      SG: sg,
      transport,
      ports: composePorts(ports),
      traffic,
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz transport + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('transport')) {
        result.rulesToDelete.push({ ...rule, transport: rule.transport === 'TCP' ? 'UDP' : 'TCP' })
      }
    } else {
      result.rulesToDelete.push(rule)
    }
  })

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
      sgLocal: centerSg,
      SG: sg,
      ICMP: { IPv, Types: types },
      traffic,
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz ipv + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('ipv')) {
        result.rulesToDelete.push({ ...rule, ICMP: { ...rule.ICMP, IPv: rule.ICMP.IPv === 'IPv6' ? 'IPv4' : 'IPv6' } })
      }
    } else {
      result.rulesToDelete.push(rule)
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

  rulesSgFqdnTo.forEach(({ fqdn, ports, transport, logs, formChanges, action, prioritySome }) => {
    const rule = {
      FQDN: fqdn,
      sgFrom: centerSg,
      logs: !!logs,
      transport,
      ports: composePorts(ports),
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz transport + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('transport')) {
        result.rulesToDelete.push({ ...rule, transport: rule.transport === 'TCP' ? 'UDP' : 'TCP' })
      }
    } else {
      result.rulesToDelete.push(rule)
    }
  })

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
  sgCidrRules.forEach(({ cidr, ports, transport, logs, trace, traffic, formChanges, action, prioritySome }) => {
    const rule = {
      CIDR: cidr,
      SG: centerSg,
      transport,
      ports: composePorts(ports),
      traffic,
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz transport + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('transport')) {
        result.rulesToDelete.push({ ...rule, transport: rule.transport === 'TCP' ? 'UDP' : 'TCP' })
      }
    } else {
      result.rulesToDelete.push(rule)
    }
  })

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
      traffic,
      logs: !!logs,
      trace: !!trace,
      action,
      priority: prioritySome || prioritySome === 0 ? { some: prioritySome } : undefined,
    }
    if (formChanges?.status !== STATUSES.deleted) {
      result.rules.push(rule)
      /* cuz ipv + sg === alt key (primary is internal on backend) */
      if (formChanges?.status !== STATUSES.new && formChanges?.modifiedFields?.includes('ipv')) {
        result.rulesToDelete.push({ ...rule, ICMP: { ...rule.ICMP, IPv: rule.ICMP.IPv === 'IPv6' ? 'IPv4' : 'IPv6' } })
      }
    } else {
      result.rulesToDelete.push(rule)
    }
  })

  return result
}
