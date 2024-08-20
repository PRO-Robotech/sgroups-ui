import { TFormChanges } from 'localTypes/rules'
import { STATUSES } from 'constants/rules'

export const getChanges = <T extends { formChanges?: TFormChanges }>(
  rules: T[],
): { newRules: T[]; diffRules: T[]; deletedRules: T[] } | null => {
  const result: { newRules: T[]; diffRules: T[]; deletedRules: T[] } = {
    newRules: [],
    diffRules: [],
    deletedRules: [],
  }

  rules.forEach(el => {
    if (el.formChanges?.status === STATUSES.new) {
      result.newRules.push(el)
    }
    if (el.formChanges?.status === STATUSES.modified) {
      result.diffRules.push(el)
    }
    if (el.formChanges?.status === STATUSES.deleted) {
      result.deletedRules.push(el)
    }
  })

  if (result.newRules.length === 0 && result.diffRules.length === 0 && result.deletedRules.length === 0) {
    return null
  }

  return result
}
