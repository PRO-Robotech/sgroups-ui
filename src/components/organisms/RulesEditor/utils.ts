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
  return rules.flatMap(({ sgFrom, transport, ports, logs }) => {
    if (ports.length > 0) {
      return ports.map(({ s, d }) => ({
        sg: sgFrom,
        transport,
        portsSource: s,
        portsDestination: d,
        logs,
      }))
    }
    return {
      sg: sgFrom,
      transport,
      logs,
    }
  })
}

export const mapRulesSgTo = (rules: TSgRule[]): TFormSgRule[] => {
  return rules.flatMap(({ sgTo, transport, ports, logs }) => {
    if (ports.length > 0) {
      return ports.map(({ s, d }) => ({
        sg: sgTo,
        transport,
        portsSource: s,
        portsDestination: d,
        logs,
      }))
    }
    return {
      sg: sgTo,
      transport,
      logs,
    }
  })
}

export const mapRulesFqdnTo = (rules: TFqdnRule[]): TFormFqdnRule[] => {
  return rules.flatMap(({ FQDN, transport, ports, logs }) => {
    if (ports.length > 0) {
      return ports.map(({ s, d }) => ({
        fqdn: FQDN,
        transport,
        portsSource: s,
        portsDestination: d,
        logs,
      }))
    }
    return {
      fqdn: FQDN,
      transport,
      logs,
    }
  })
}

export const mapRulesCidrSgFrom = (rules: TCidrRule[]): TFormCidrSgRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ CIDR, ports, transport, logs, trace, traffic }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          cidr: CIDR,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
        }))
      }
      return {
        cidr: CIDR,
        transport,
        logs,
        trace,
        traffic,
      }
    })
}

export const mapRulesCidrSgTo = (rules: TCidrRule[]): TFormCidrSgRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ CIDR, ports, transport, logs, trace, traffic }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          cidr: CIDR,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
        }))
      }
      return {
        cidr: CIDR,
        transport,
        logs,
        trace,
        traffic,
      }
    })
}

export const mapRulesSgSgIcmpFrom = (rules: TSgSgIcmpRule[]): TFormSgSgIcmpRule[] => {
  return rules.map(({ SgFrom, logs, trace, ICMP }) => ({
    sg: SgFrom,
    logs,
    trace,
    IPv: ICMP.IPv,
    types: ICMP.Types,
  }))
}

export const mapRulesSgSgIcmpTo = (rules: TSgSgIcmpRule[]): TFormSgSgIcmpRule[] => {
  return rules.map(({ SgTo, logs, trace, ICMP }) => ({
    sg: SgTo,
    logs,
    trace,
    IPv: ICMP.IPv,
    types: ICMP.Types,
  }))
}

export const mapRulesSgSgIeFrom = (rules: TSgSgIeRule[]): TFormSgSgIeRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ Sg, ports, transport, logs, trace, traffic }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          sg: Sg,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
        }))
      }
      return {
        sg: Sg,
        transport,
        logs,
        trace,
        traffic,
      }
    })
}

export const mapRulesSgSgIeTo = (rules: TSgSgIeRule[]): TFormSgSgIeRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ Sg, ports, transport, logs, trace, traffic }) => {
      if (ports.length > 0) {
        return ports.map(({ s, d }) => ({
          sg: Sg,
          portsSource: s,
          portsDestination: d,
          transport,
          logs,
          trace,
          traffic,
        }))
      }
      return {
        sg: Sg,
        transport,
        logs,
        trace,
        traffic,
      }
    })
}

export const mapRulesSgSgIeIcmpFrom = (rules: TSgSgIeIcmpRule[]): TFormSgSgIeIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Ingress')
    .flatMap(({ Sg, ICMP, logs, trace, traffic }) => {
      return {
        sg: Sg,
        IPv: ICMP.IPv,
        types: ICMP.Types,
        logs,
        trace,
        traffic,
      }
    })
}

export const mapRulesSgSgIeIcmpTo = (rules: TSgSgIeIcmpRule[]): TFormSgSgIeIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === 'Egress')
    .flatMap(({ Sg, ICMP, logs, trace, traffic }) => {
      return {
        sg: Sg,
        IPv: ICMP.IPv,
        types: ICMP.Types,
        logs,
        trace,
        traffic,
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
