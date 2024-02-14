import { TFormSgRule, TFormFqdnRule, TFormCidrSgRule, TFormSgSgIcmpRule } from 'localTypes/rules'

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
