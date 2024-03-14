import {
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
} from 'localTypes/rules'

export type TFormSgRuleChangesResult = {
  newRules: TFormSgRule[]
  diffRules: TFormSgRule[]
  deletedRules: TFormSgRule[]
}

export type TFormFqdnRuleChangesResult = {
  newRules: TFormFqdnRule[]
  diffRules: TFormFqdnRule[]
  deletedRules: TFormFqdnRule[]
}

export type TFormCidrSgRuleChangesResult = {
  newRules: TFormCidrSgRule[]
  diffRules: TFormCidrSgRule[]
  deletedRules: TFormCidrSgRule[]
}

export type TFormSgSgIcmpRuleChangesResult = {
  newRules: TFormSgSgIcmpRule[]
  diffRules: TFormSgSgIcmpRule[]
  deletedRules: TFormSgSgIcmpRule[]
}

export type TFormSgSgIeRuleChangesResult = {
  newRules: TFormSgSgIeRule[]
  diffRules: TFormSgSgIeRule[]
  deletedRules: TFormSgSgIeRule[]
}

export type TFormSgSgIeIcmpRuleChangesResult = {
  newRules: TFormSgSgIeIcmpRule[]
  diffRules: TFormSgSgIeIcmpRule[]
  deletedRules: TFormSgSgIeIcmpRule[]
}
