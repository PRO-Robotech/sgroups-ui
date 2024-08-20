import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgSgIcmpRule } from 'localTypes/rules'
import { getModifiedFieldsInSgSgIcmpRule } from './getModifiedFields'
import { findSgSgIcmpPair } from './legacyFindPair'
import { getNumberedPriorty } from './getNumberedPriority'

/* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>,
  rulesOtherside: TFormSgSgIcmpRule[],
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>,
  centerSg: string | undefined,
  oldValues: TFormSgSgIcmpRule,
  values: Omit<TFormSgSgIcmpRule, 'prioritySome'> & { prioritySome?: number | string },
  toggleEditPopover: (index: number) => void,
): void => {
  const numberedPriorty = getNumberedPriorty(values.prioritySome)
  const newSgSgIcmpRules = [...rulesAll]
  const index = newSgSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  const newSgSgIcmpRulesOtherside = [...rulesOtherside]
  /* legacy */
  const newSgSgSgIcmpRulesOthersideIndex =
    values.sg === centerSg ? findSgSgIcmpPair(centerSg, newSgSgIcmpRules[index], rulesOtherside) : undefined
  if (newSgSgIcmpRules[index].formChanges?.status === STATUSES.new) {
    newSgSgIcmpRules[index] = {
      ...values,
      initialValues: oldValues.initialValues,
      prioritySome: numberedPriorty,
      formChanges: { status: STATUSES.new },
      id: oldValues.id,
    }
    if (newSgSgSgIcmpRulesOthersideIndex) {
      newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
        ...values,
        initialValues: oldValues.initialValues,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.new },
        id: newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex].id,
      }
    }
  } else {
    const modifiedFields = getModifiedFieldsInSgSgIcmpRule(newSgSgIcmpRules[index], {
      ...values,
      prioritySome: numberedPriorty,
    })
    if (modifiedFields.length !== 0) {
      newSgSgIcmpRules[index] = {
        ...values,
        initialValues: oldValues.initialValues,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.modified, modifiedFields },
        id: oldValues.id,
      }
      if (newSgSgSgIcmpRulesOthersideIndex) {
        newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
          ...values,
          initialValues: oldValues.initialValues,
          prioritySome: numberedPriorty,
          formChanges: { status: STATUSES.modified, modifiedFields },
          id: newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex].id,
        }
      }
    } else {
      newSgSgIcmpRules[index] = {
        ...newSgSgIcmpRules[index].initialValues,
        initialValues: { ...newSgSgIcmpRules[index].initialValues },
        formChanges: undefined,
        id: oldValues.id,
      }
      if (newSgSgSgIcmpRulesOthersideIndex) {
        newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
          ...newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex].initialValues,
          initialValues: { ...newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex].initialValues },
          formChanges: undefined,
          id: newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex].id,
        }
      }
    }
  }
  dispatch(setRules(newSgSgIcmpRules))
  if (newSgSgSgIcmpRulesOthersideIndex) {
    dispatch(setRulesOtherside(newSgSgIcmpRulesOtherside))
  }
  toggleEditPopover(index)
}

/* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>,
  rulesOtherside: TFormSgSgIcmpRule[],
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>,
  centerSg: string | undefined,
  oldValues: TFormSgSgIcmpRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newSgSgIcmpRules = [...rulesAll]
  const index = newSgSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  const newSgSgIcmpRulesOtherside = [...rulesOtherside]
  /* legacy */
  const newSgSgSgIcmpRulesOthersideIndex = findSgSgIcmpPair(centerSg, oldValues, rulesOtherside)
  const newEditOpenRules = [...editOpen]
  if (newSgSgIcmpRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newSgSgIcmpRules.slice(0, index), ...newSgSgIcmpRules.slice(index + 1)]))
    dispatch(
      setRulesOtherside([
        ...newSgSgIcmpRulesOtherside.slice(0, newSgSgSgIcmpRulesOthersideIndex),
        ...newSgSgIcmpRulesOtherside.slice(newSgSgSgIcmpRulesOthersideIndex + 1),
      ]),
    )
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newSgSgIcmpRules[index] = { ...newSgSgIcmpRules[index], formChanges: { status: STATUSES.deleted } }
    newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
      ...newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newSgSgIcmpRules))
    dispatch(setRulesOtherside(newSgSgIcmpRulesOtherside))
    toggleEditPopover(index)
  }
}

/* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>,
  rulesOtherside: TFormSgSgIcmpRule[],
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>,
  centerSg: string | undefined,
  oldValues: TFormSgSgIcmpRule,
): void => {
  const newSgSgIcmpRules = [...rulesAll]
  const index = newSgSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  const values = newSgSgIcmpRules[index]
  newSgSgIcmpRules[index] = {
    ...values,
    checked: false,
    formChanges: undefined,
  }
  const newSgSgIcmpRulesOtherside = [...rulesOtherside]
  const newSgSgSgIcmpRulesOthersideIndex = findSgSgIcmpPair(centerSg, oldValues, rulesOtherside)
  const valuesOtherside = newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex]
  newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
    ...valuesOtherside,
    checked: false,
    formChanges: undefined,
  }
  if (values.formChanges && values.formChanges.modifiedFields && values.formChanges.modifiedFields.length > 0) {
    newSgSgIcmpRules[index] = {
      ...newSgSgIcmpRules[index],
      formChanges: {
        status: STATUSES.modified,
        modifiedFields: values.formChanges?.modifiedFields,
      },
    }
  }
  if (values.formChanges && values.formChanges.modifiedFields && values.formChanges.modifiedFields.length > 0) {
    newSgSgIcmpRulesOtherside[index] = {
      ...newSgSgIcmpRulesOtherside[index],
      formChanges: {
        status: STATUSES.modified,
        modifiedFields: valuesOtherside.formChanges?.modifiedFields,
      },
    }
  }
  dispatch(setRules(newSgSgIcmpRules))
  dispatch(setRulesOtherside(newSgSgIcmpRulesOtherside))
}
