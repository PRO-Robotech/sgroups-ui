import {
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
} from 'localTypes/rules'

type TCheckIfSomeChangesMarkedProps = {
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

export const checkIfSomeChangesMarked = (data: TCheckIfSomeChangesMarkedProps): boolean => {
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
  return [
    rulesSgSgFrom.some(({ checked }) => checked === true),
    rulesSgSgTo.some(({ checked }) => checked === true),
    rulesSgSgIcmpFrom.some(({ checked }) => checked === true),
    rulesSgSgIcmpTo.some(({ checked }) => checked === true),
    rulesSgSgIeFrom.some(({ checked }) => checked === true),
    rulesSgSgIeTo.some(({ checked }) => checked === true),
    rulesSgSgIeIcmpFrom.some(({ checked }) => checked === true),
    rulesSgSgIeIcmpTo.some(({ checked }) => checked === true),
    rulesSgFqdnTo.some(({ checked }) => checked === true),
    rulesSgCidrFrom.some(({ checked }) => checked === true),
    rulesSgCidrTo.some(({ checked }) => checked === true),
    rulesSgCidrIcmpFrom.some(({ checked }) => checked === true),
    rulesSgCidrIcmpTo.some(({ checked }) => checked === true),
  ].includes(true)
}
