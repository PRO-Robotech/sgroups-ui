import { TFormChanges } from 'localTypes/rules'

export const checkIfChangesExist = (data: (unknown & { formChanges?: TFormChanges })[]): boolean => {
  return data.some(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
}
