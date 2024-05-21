import {
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
} from 'localTypes/rules'

export const getModifiedFieldsInSgSgRule = (rule: TFormSgSgRule, values: TFormSgSgRule): string[] => {
  const modifiedFields = []
  if (rule.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgSgIcmpRule = (rule: TFormSgSgIcmpRule, values: TFormSgSgIcmpRule): string[] => {
  const modifiedFields = []
  if (rule.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.IPv !== values.IPv) {
    modifiedFields.push('ipv')
  }
  if (JSON.stringify(rule.types.sort()) !== JSON.stringify(values.types.sort())) {
    modifiedFields.push('types')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgSgIeRule = (rule: TFormSgSgIeRule, values: TFormSgSgIeRule): string[] => {
  const modifiedFields = []
  if (rule.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgSgIeIcmpRule = (rule: TFormSgSgIeIcmpRule, values: TFormSgSgIeIcmpRule): string[] => {
  const modifiedFields = []
  if (rule.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.IPv !== values.IPv) {
    modifiedFields.push('ipv')
  }
  if (JSON.stringify(rule.types.sort()) !== JSON.stringify(values.types.sort())) {
    modifiedFields.push('types')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgFqdnRule = (rule: TFormSgFqdnRule, values: TFormSgFqdnRule): string[] => {
  const modifiedFields = []
  if (rule.fqdn !== values.fqdn) {
    modifiedFields.push('fqdn')
  }
  if (rule.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgCidrRule = (rule: TFormSgCidrRule, values: TFormSgCidrRule): string[] => {
  const modifiedFields = []
  if (rule.cidr !== values.cidr) {
    modifiedFields.push('cidr')
  }
  if (rule.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgCidrIcmpRule = (rule: TFormSgCidrIcmpRule, values: TFormSgCidrIcmpRule): string[] => {
  const modifiedFields = []
  if (rule.cidr !== values.cidr) {
    modifiedFields.push('cidr')
  }
  if (rule.IPv !== values.IPv) {
    modifiedFields.push('ipv')
  }
  if (JSON.stringify(rule.types.sort()) !== JSON.stringify(values.types.sort())) {
    modifiedFields.push('types')
  }
  if (rule.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}
