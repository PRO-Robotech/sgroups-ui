import { nanoid } from 'nanoid'
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
  TFormChanges,
} from 'localTypes/rules'

export const mapRulesSgSg = (rules: TSgSgRule[], type: 'Ingress' | 'Egress'): TFormSgSgRule[] => {
  return rules.map(({ sgFrom, sgTo, transport, ports, logs, action, priority }) => ({
    id: nanoid(),
    sg: type === 'Ingress' ? sgFrom : sgTo,
    transport,
    ports,
    logs,
    action,
    prioritySome: priority?.some,
    initialValues: {
      sg: type === 'Ingress' ? sgFrom : sgTo,
      transport,
      ports,
      logs,
      action,
      prioritySome: priority?.some,
    },
  }))
}

export const mapRulesSgSgIcmp = (rules: TSgSgIcmpRule[], type: 'Ingress' | 'Egress'): TFormSgSgIcmpRule[] => {
  return rules.map(({ SgFrom, SgTo, logs, trace, ICMP, action, priority }) => ({
    id: nanoid(),
    sg: type === 'Ingress' ? SgFrom : SgTo,
    IPv: ICMP.IPv,
    types: ICMP.Types,
    logs,
    trace,
    action,
    prioritySome: priority?.some,
    initialValues: {
      sg: type === 'Ingress' ? SgFrom : SgTo,
      IPv: ICMP.IPv,
      types: ICMP.Types,
      logs,
      trace,
      action,
      prioritySome: priority?.some,
    },
  }))
}

export const mapRulesSgSgIe = (rules: TSgSgIeRule[], type: 'Ingress' | 'Egress'): TFormSgSgIeRule[] => {
  return rules
    .filter(({ traffic }) => traffic === type)
    .map(({ Sg, ports, transport, logs, trace, traffic, action, priority }) => ({
      id: nanoid(),
      sg: Sg,
      transport,
      traffic,
      ports,
      logs,
      trace,
      action,
      prioritySome: priority?.some,
      initialValues: {
        sg: Sg,
        transport,
        traffic,
        ports,
        logs,
        trace,
        action,
        prioritySome: priority?.some,
      },
    }))
}

export const mapRulesSgSgIeIcmp = (rules: TSgSgIeIcmpRule[], type: 'Ingress' | 'Egress'): TFormSgSgIeIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === type)
    .flatMap(({ Sg, ICMP, logs, trace, traffic, action, priority }) => {
      return {
        id: nanoid(),
        sg: Sg,
        traffic,
        IPv: ICMP.IPv,
        types: ICMP.Types,
        logs,
        trace,
        action,
        prioritySome: priority?.some,
        initialValues: {
          sg: Sg,
          traffic,
          IPv: ICMP.IPv,
          types: ICMP.Types,
          logs,
          trace,
          action,
          prioritySome: priority?.some,
        },
      }
    })
}

export const mapRulesSgFqdn = (rules: TSgFqdnRule[]): TFormSgFqdnRule[] => {
  return rules.map(({ FQDN, transport, ports, logs, action, priority }) => ({
    id: nanoid(),
    fqdn: FQDN,
    transport,
    ports,
    logs,
    action,
    prioritySome: priority?.some,
    initialValues: {
      fqdn: FQDN,
      transport,
      ports,
      logs,
      action,
      prioritySome: priority?.some,
    },
  }))
}

export const mapRulesSgCidr = (rules: TSgCidrRule[], type: 'Ingress' | 'Egress'): TFormSgCidrRule[] => {
  return rules
    .filter(({ traffic }) => traffic === type)
    .map(({ CIDR, ports, transport, logs, trace, traffic, action, priority }) => ({
      id: nanoid(),
      cidr: CIDR,
      transport,
      traffic,
      ports,
      logs,
      trace,
      action,
      prioritySome: priority?.some,
      initialValues: {
        cidr: CIDR,
        transport,
        traffic,
        ports,
        logs,
        trace,
        action,
        prioritySome: priority?.some,
      },
    }))
}

export const mapRulesSgCidrIcmp = (rules: TSgCidrIcmpRule[], type: 'Ingress' | 'Egress'): TFormSgCidrIcmpRule[] => {
  return rules
    .filter(({ traffic }) => traffic === type)
    .flatMap(({ CIDR, ICMP, logs, trace, traffic, action, priority }) => {
      return {
        id: nanoid(),
        cidr: CIDR,
        traffic,
        IPv: ICMP.IPv,
        types: ICMP.Types,
        logs,
        trace,
        action,
        prioritySome: priority?.some,
        initialValues: {
          cidr: CIDR,
          traffic,
          IPv: ICMP.IPv,
          types: ICMP.Types,
          logs,
          trace,
          action,
          prioritySome: priority?.some,
        },
      }
    })
}

export const checkIfChangesExist = (data: (unknown & { formChanges?: TFormChanges })[]): boolean => {
  return data.some(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
}
