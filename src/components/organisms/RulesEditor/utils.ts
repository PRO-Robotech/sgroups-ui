import {
  TSgRule,
  TFormSgRule,
  TFqdnRule,
  TFormFqdnRule,
  TCidrRule,
  TFormCidrSgRule,
  TSgSgIcmpRule,
  TFormSgSgIcmpRule,
  TSgSgIeRule,
  TFormSgSgIeRule,
  TSgSgIeIcmpRule,
  TFormSgSgIeIcmpRule,
} from 'localTypes/rules'

export const mapRulesSgFrom = (rules: TSgRule[]): TFormSgRule[] => {
  return rules.flatMap(({ sgFrom, transport, ports, logs, action, priority }) => {
    if (ports.length > 0) {
      return ports.map(({ s, d }) => ({
        sg: sgFrom,
        transport,
        portsSource: s,
        portsDestination: d,
        logs,
        action,
        prioritySome: priority?.some,
      }))
    }
    return {
      sg: sgFrom,
      transport,
      logs,
      action,
      prioritySome: priority?.some,
    }
  })
}

export const mapRulesSgTo = (rules: TSgRule[]): TFormSgRule[] => {
  return rules.flatMap(({ sgTo, transport, ports, logs, action, priority }) => {
    if (ports.length > 0) {
      return ports.map(({ s, d }) => ({
        sg: sgTo,
        transport,
        portsSource: s,
        portsDestination: d,
        logs,
        action,
        prioritySome: priority?.some,
      }))
    }
    return {
      sg: sgTo,
      transport,
      logs,
      action,
      prioritySome: priority?.some,
    }
  })
}

export const mapRulesFqdnTo = (rules: TFqdnRule[]): TFormFqdnRule[] => {
  return rules.flatMap(({ FQDN, transport, ports, logs, action, priority }) => {
    if (ports.length > 0) {
      return ports.map(({ s, d }) => ({
        fqdn: FQDN,
        transport,
        portsSource: s,
        portsDestination: d,
        logs,
        action,
        prioritySome: priority?.some,
      }))
    }
    return {
      fqdn: FQDN,
      transport,
      logs,
      action,
      prioritySome: priority?.some,
    }
  })
}

export const mapRulesCidrSgFrom = (rules: TCidrRule[]): TFormCidrSgRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ CIDR, ports, transport, logs, trace, traffic, action, priority }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          cidr: CIDR,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
          action,
          prioritySome: priority?.some,
        }))
      }
      return {
        cidr: CIDR,
        transport,
        logs,
        trace,
        traffic,
        action,
        prioritySome: priority?.some,
      }
    })
}

export const mapRulesCidrSgTo = (rules: TCidrRule[]): TFormCidrSgRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ CIDR, ports, transport, logs, trace, traffic, action, priority }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          cidr: CIDR,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
          action,
          prioritySome: priority?.some,
        }))
      }
      return {
        cidr: CIDR,
        transport,
        logs,
        trace,
        traffic,
        action,
        prioritySome: priority?.some,
      }
    })
}

export const mapRulesSgSgIcmpFrom = (rules: TSgSgIcmpRule[]): TFormSgSgIcmpRule[] => {
  return rules.map(({ SgFrom, logs, trace, ICMP, action, priority }) => ({
    sg: SgFrom,
    logs,
    trace,
    IPv: ICMP.IPv,
    types: ICMP.Types,
    action,
    prioritySome: priority?.some,
  }))
}

export const mapRulesSgSgIcmpTo = (rules: TSgSgIcmpRule[]): TFormSgSgIcmpRule[] => {
  return rules.map(({ SgTo, logs, trace, ICMP, action, priority }) => ({
    sg: SgTo,
    logs,
    trace,
    IPv: ICMP.IPv,
    types: ICMP.Types,
    action,
    prioritySome: priority?.some,
  }))
}

export const mapRulesSgSgIeFrom = (rules: TSgSgIeRule[]): TFormSgSgIeRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ Sg, ports, transport, logs, trace, traffic, action, priority }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          sg: Sg,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
          action,
          prioritySome: priority?.some,
        }))
      }
      return {
        sg: Sg,
        transport,
        logs,
        trace,
        traffic,
        action,
        prioritySome: priority?.some,
      }
    })
}

export const mapRulesSgSgIeTo = (rules: TSgSgIeRule[]): TFormSgSgIeRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ Sg, ports, transport, logs, trace, traffic, action, priority }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          sg: Sg,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
          action,
          prioritySome: priority?.some,
        }))
      }
      return {
        sg: Sg,
        transport,
        logs,
        trace,
        traffic,
        action,
        prioritySome: priority?.some,
      }
    })
}

export const mapRulesSgSgIeIcmpFrom = (rules: TSgSgIeIcmpRule[]): TFormSgSgIeIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ Sg, ICMP, logs, trace, traffic, action, priority }) => {
      return {
        sg: Sg,
        IPv: ICMP.IPv,
        types: ICMP.Types,
        logs,
        trace,
        traffic,
        action,
        prioritySome: priority?.some,
      }
    })
}

export const mapRulesSgSgIeIcmpTo = (rules: TSgSgIeIcmpRule[]): TFormSgSgIeIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ Sg, ICMP, logs, trace, traffic, action, priority }) => {
      return {
        sg: Sg,
        IPv: ICMP.IPv,
        types: ICMP.Types,
        logs,
        trace,
        traffic,
        action,
        prioritySome: priority?.some,
      }
    })
}

export const checkIfChangesExist = (
  rulesSgFrom: TFormSgRule[],
  rulesSgTo: TFormSgRule[],
  rulesFqdnTo: TFormFqdnRule[],
  rulesCidrSgFrom: TFormCidrSgRule[],
  rulesCidrSgTo: TFormCidrSgRule[],
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[],
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[],
  rulesSgSgIeFrom: TFormSgSgIeRule[],
  rulesSgSgIeTo: TFormSgSgIeRule[],
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[],
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[],
): boolean => {
  if (
    [
      ...rulesSgFrom,
      ...rulesSgTo,
      ...rulesFqdnTo,
      ...rulesCidrSgFrom,
      ...rulesCidrSgTo,
      ...rulesSgSgIcmpFrom,
      ...rulesSgSgIcmpTo,
      ...rulesSgSgIeFrom,
      ...rulesSgSgIeTo,
      ...rulesSgSgIeIcmpFrom,
      ...rulesSgSgIeIcmpTo,
    ].some(
      ({ formChanges }) =>
        formChanges?.status === 'new' ||
        formChanges?.status === 'deleted' ||
        (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
    )
  ) {
    return true
  }
  return false
}
