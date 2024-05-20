import {
  TSgSgRule,
  TFormSgSgRule,
  TSgSgIcmpRule,
  TFormSgSgIcmpRule,
  TSgSgIeRule,
  TFormSgSgIeRule,
  TSgSgIeIcmpRule,
  TFormSgSgIeIcmpRule,
  TSgFqdnRule,
  TFormSgFqdnRule,
  TSgCidrRule,
  TFormSgCidrRule,
  TSgCidrIcmpRule,
  TFormSgCidrIcmpRule,
} from 'localTypes/rules'

export const mapRulesSgSgFrom = (rules: TSgSgRule[]): TFormSgSgRule[] => {
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

export const mapRulesSgSgTo = (rules: TSgSgRule[]): TFormSgSgRule[] => {
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

export const mapRulesSgFqdnTo = (rules: TSgFqdnRule[]): TFormSgFqdnRule[] => {
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

export const mapRulesSgCidrFrom = (rules: TSgCidrRule[]): TFormSgCidrRule[] => {
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

export const mapRulesSgCidrTo = (rules: TSgCidrRule[]): TFormSgCidrRule[] => {
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

export const mapRulesSgCidrIcmpFrom = (rules: TSgCidrIcmpRule[]): TFormSgCidrIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ CIDR, ICMP, logs, trace, traffic, action, priority }) => {
      return {
        cidr: CIDR,
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

export const mapRulesSgCidrIcmpTo = (rules: TSgCidrIcmpRule[]): TFormSgCidrIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ CIDR, ICMP, logs, trace, traffic, action, priority }) => {
      return {
        cidr: CIDR,
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

type TCheckIfChangesExistProps = {
  rulesSgSgFrom: TFormSgSgRule[]
  rulesSgSgTo: TFormSgSgRule[]
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[]
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[]
  rulesSgSgIeFrom: TFormSgSgIeRule[]
  rulesSgSgIeTo: TFormSgSgIeRule[]
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[]
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[]
  rulesSgFqdnTo: TFormSgFqdnRule[]
  rulesSgCidrFrom: TFormSgCidrRule[]
  rulesSgCidrTo: TFormSgCidrRule[]
  rulesSgCidrIcmpFrom: TFormSgCidrIcmpRule[]
  rulesSgCidrIcmpTo: TFormSgCidrIcmpRule[]
}

export const checkIfChangesExist = (data: TCheckIfChangesExistProps): boolean => {
  const {
    rulesSgSgFrom,
    rulesSgSgTo,
    rulesSgSgIcmpFrom,
    rulesSgSgIcmpTo,
    rulesSgSgIeFrom,
    rulesSgSgIeTo,
    rulesSgSgIeIcmpFrom,
    rulesSgSgIeIcmpTo,
    rulesSgFqdnTo,
    rulesSgCidrFrom,
    rulesSgCidrTo,
    rulesSgCidrIcmpFrom,
    rulesSgCidrIcmpTo,
  } = data
  if (
    [
      ...rulesSgSgFrom,
      ...rulesSgSgTo,
      ...rulesSgSgIcmpFrom,
      ...rulesSgSgIcmpTo,
      ...rulesSgSgIeFrom,
      ...rulesSgSgIeTo,
      ...rulesSgSgIeIcmpFrom,
      ...rulesSgSgIeIcmpTo,
      ...rulesSgFqdnTo,
      ...rulesSgCidrFrom,
      ...rulesSgCidrTo,
      ...rulesSgCidrIcmpFrom,
      ...rulesSgCidrIcmpTo,
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
