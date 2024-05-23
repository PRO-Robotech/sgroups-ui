import {
  TSgSgRule,
  TSgSgIcmpRule,
  TSgSgIeRule,
  TSgSgIeIcmpRule,
  TSgFqdnRule,
  TSgCidrRule,
  TSgCidrIcmpRule,
} from 'localTypes/rules'

export const findSgSgRuleInResultArr = (rule: TSgSgRule, rulesArr: TSgSgRule[]): TSgSgRule | undefined => {
  return rulesArr.find(
    ({ sgFrom, sgTo, logs, transport, action, priority }) =>
      sgFrom === rule.sgFrom &&
      sgTo === rule.sgTo &&
      logs === rule.logs &&
      transport === rule.transport &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}

export const findSgSgIcmpRuleInResultArr = (
  rule: TSgSgIcmpRule,
  rulesArr: TSgSgIcmpRule[],
): TSgSgIcmpRule | undefined => {
  return rulesArr.find(
    ({ SgFrom, SgTo, logs, trace, ICMP, action, priority }) =>
      SgFrom === rule.SgFrom &&
      SgTo === rule.SgTo &&
      logs === rule.logs &&
      trace === rule.trace &&
      ICMP.IPv === rule.ICMP.IPv &&
      JSON.stringify(ICMP.Types.sort()) === JSON.stringify(rule.ICMP.Types.sort()) &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}

export const findSgSgIeRuleInResultArr = (rule: TSgSgIeRule, rulesArr: TSgSgIeRule[]): TSgSgIeRule | undefined => {
  return rulesArr.find(
    ({ Sg, SgLocal, logs, transport, trace, traffic, action, priority }) =>
      Sg === rule.Sg &&
      SgLocal === rule.SgLocal &&
      logs === rule.logs &&
      transport === rule.transport &&
      trace === rule.trace &&
      traffic === rule.traffic &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}

export const findSgSgIeIcmpRuleInResultArr = (
  rule: TSgSgIeIcmpRule,
  rulesArr: TSgSgIeIcmpRule[],
): TSgSgIeIcmpRule | undefined => {
  return rulesArr.find(
    ({ Sg, SgLocal, logs, trace, traffic, ICMP, action, priority }) =>
      Sg === rule.Sg &&
      SgLocal === rule.SgLocal &&
      logs === rule.logs &&
      trace === rule.trace &&
      traffic === rule.traffic &&
      ICMP.IPv === rule.ICMP.IPv &&
      ICMP.IPv === rule.ICMP.IPv &&
      JSON.stringify(ICMP.Types.sort()) === JSON.stringify(rule.ICMP.Types.sort()) &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}

export const findSgFqdnRuleInResultArr = (rule: TSgFqdnRule, rulesArr: TSgFqdnRule[]): TSgFqdnRule | undefined => {
  return rulesArr.find(
    ({ sgFrom, FQDN, logs, transport, action, priority }) =>
      sgFrom === rule.sgFrom &&
      FQDN === rule.FQDN &&
      logs === rule.logs &&
      transport === rule.transport &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}

export const findSgCidrRuleInResultArr = (rule: TSgCidrRule, rulesArr: TSgCidrRule[]): TSgCidrRule | undefined => {
  return rulesArr.find(
    ({ CIDR, SG, logs, transport, trace, traffic, action, priority }) =>
      CIDR === rule.CIDR &&
      SG === rule.SG &&
      logs === rule.logs &&
      transport === rule.transport &&
      trace === rule.trace &&
      traffic === rule.traffic &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}

export const findSgCidrIcmpRuleInResultArr = (
  rule: TSgCidrIcmpRule,
  rulesArr: TSgCidrIcmpRule[],
): TSgCidrIcmpRule | undefined => {
  return rulesArr.find(
    ({ SG, CIDR, logs, trace, traffic, ICMP, action, priority }) =>
      SG === rule.SG &&
      CIDR === rule.CIDR &&
      logs === rule.logs &&
      trace === rule.trace &&
      traffic === rule.traffic &&
      ICMP.IPv === rule.ICMP.IPv &&
      ICMP.IPv === rule.ICMP.IPv &&
      JSON.stringify(ICMP.Types.sort()) === JSON.stringify(rule.ICMP.Types.sort()) &&
      action === rule.action &&
      priority?.some === rule.priority?.some,
  )
}
