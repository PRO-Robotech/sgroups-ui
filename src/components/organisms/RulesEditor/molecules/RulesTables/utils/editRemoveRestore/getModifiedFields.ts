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
  if (rule.initialValues.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.initialValues.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.initialValues.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.initialValues.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgSgIcmpRule = (rule: TFormSgSgIcmpRule, values: TFormSgSgIcmpRule): string[] => {
  const modifiedFields = []
  if (rule.initialValues.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.initialValues.IPv !== values.IPv) {
    modifiedFields.push('ipv')
  }
  if (JSON.stringify(rule.initialValues.types.sort()) !== JSON.stringify(values.types.sort())) {
    modifiedFields.push('types')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgSgIeRule = (rule: TFormSgSgIeRule, values: TFormSgSgIeRule): string[] => {
  const modifiedFields = []
  console.log(rule.initialValues)
  if (rule.initialValues.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.initialValues.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.initialValues.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.initialValues.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgSgIeIcmpRule = (rule: TFormSgSgIeIcmpRule, values: TFormSgSgIeIcmpRule): string[] => {
  const modifiedFields = []
  if (rule.initialValues.sg !== values.sg) {
    modifiedFields.push('sg')
  }
  if (rule.initialValues.IPv !== values.IPv) {
    modifiedFields.push('ipv')
  }
  if (JSON.stringify(rule.initialValues.types.sort()) !== JSON.stringify(values.types.sort())) {
    modifiedFields.push('types')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgFqdnRule = (rule: TFormSgFqdnRule, values: TFormSgFqdnRule): string[] => {
  const modifiedFields = []
  if (rule.initialValues.fqdn !== values.fqdn) {
    modifiedFields.push('fqdn')
  }
  if (rule.initialValues.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.initialValues.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.initialValues.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgCidrRule = (rule: TFormSgCidrRule, values: TFormSgCidrRule): string[] => {
  const modifiedFields = []
  if (rule.initialValues.cidr !== values.cidr) {
    modifiedFields.push('cidr')
  }
  if (rule.initialValues.portsSource !== values.portsSource) {
    modifiedFields.push('portsSource')
  }
  if (rule.initialValues.portsDestination !== values.portsDestination) {
    modifiedFields.push('portsDestination')
  }
  if (rule.initialValues.transport !== values.transport) {
    modifiedFields.push('transport')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}

export const getModifiedFieldsInSgCidrIcmpRule = (rule: TFormSgCidrIcmpRule, values: TFormSgCidrIcmpRule): string[] => {
  const modifiedFields = []
  if (rule.initialValues.cidr !== values.cidr) {
    modifiedFields.push('cidr')
  }
  if (rule.initialValues.IPv !== values.IPv) {
    modifiedFields.push('ipv')
  }
  if (JSON.stringify(rule.initialValues.types.sort()) !== JSON.stringify(values.types.sort())) {
    modifiedFields.push('types')
  }
  if (rule.initialValues.logs !== values.logs) {
    modifiedFields.push('logs')
  }
  if (rule.initialValues.trace !== values.trace) {
    modifiedFields.push('trace')
  }
  if (rule.initialValues.action !== values.action) {
    modifiedFields.push('action')
  }
  if (rule.initialValues.prioritySome !== values.prioritySome) {
    modifiedFields.push('prioritySome')
  }
  return modifiedFields
}
