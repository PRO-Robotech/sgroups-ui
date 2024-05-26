import { TFormChanges } from 'localTypes/rules'
import { STATUSES } from 'constants/rules'

export const isChangesExist = <T extends { formChanges?: TFormChanges }>(rules: T[]): boolean => {
  return rules.some(
    ({ formChanges }) =>
      formChanges?.status === STATUSES.new ||
      formChanges?.status === STATUSES.deleted ||
      (formChanges?.status === STATUSES.modified &&
        formChanges.modifiedFields &&
        formChanges.modifiedFields.length > 0),
  )
}
