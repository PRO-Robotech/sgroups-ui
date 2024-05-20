import {
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
} from 'localTypes/rules'

export type TFormSgSgRuleChangesResult = {
  newRules: TFormSgSgRule[]
  diffRules: TFormSgSgRule[]
  deletedRules: TFormSgSgRule[]
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

export type TFormSgFqdnRuleChangesResult = {
  newRules: TFormSgFqdnRule[]
  diffRules: TFormSgFqdnRule[]
  deletedRules: TFormSgFqdnRule[]
}

export type TFormSgCidrRuleChangesResult = {
  newRules: TFormSgCidrRule[]
  diffRules: TFormSgCidrRule[]
  deletedRules: TFormSgCidrRule[]
}

export type TFormSgCidrIcmpRuleChangesResult = {
  newRules: TFormSgCidrIcmpRule[]
  diffRules: TFormSgCidrIcmpRule[]
  deletedRules: TFormSgCidrIcmpRule[]
}
