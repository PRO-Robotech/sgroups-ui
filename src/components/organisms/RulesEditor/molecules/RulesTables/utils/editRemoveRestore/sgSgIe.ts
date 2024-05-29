import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgSgIeRule, TTraffic } from 'localTypes/rules'
import { getModifiedFieldsInSgSgIeRule } from './getModifiedFields'
import { getNumberedPriorty } from './getNumberedPriority'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>,
  defaultTraffic: TTraffic,
  oldValues: TFormSgSgIeRule,
  values: Omit<TFormSgSgIeRule, 'prioritySome'> & { prioritySome?: number | string },
  toggleEditPopover: (index: number) => void,
): void => {
  const numberedPriorty = getNumberedPriorty(values.prioritySome)
  const newSgSgIeRules = [...rulesAll]
  const index = newSgSgIeRules.findIndex(({ id }) => id === oldValues.id)
  if (newSgSgIeRules[index].formChanges?.status === STATUSES.new) {
    newSgSgIeRules[index] = {
      ...values,
      initialValues: oldValues.initialValues,
      traffic: defaultTraffic,
      prioritySome: numberedPriorty,
      formChanges: { status: STATUSES.new },
      id: oldValues.id,
    }
  } else {
    const modifiedFields = getModifiedFieldsInSgSgIeRule(newSgSgIeRules[index], {
      ...values,
      prioritySome: numberedPriorty,
    })
    if (modifiedFields.length !== 0) {
      newSgSgIeRules[index] = {
        ...values,
        initialValues: oldValues.initialValues,
        traffic: defaultTraffic,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.modified, modifiedFields },
        id: oldValues.id,
      }
    } else {
      newSgSgIeRules[index] = {
        ...newSgSgIeRules[index].initialValues,
        initialValues: { ...newSgSgIeRules[index].initialValues },
        formChanges: undefined,
        id: values.id,
      }
    }
  }
  dispatch(setRules(newSgSgIeRules))
  toggleEditPopover(index)
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>,
  oldValues: TFormSgSgIeRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newSgSgIeRules = [...rulesAll]
  const index = newSgSgIeRules.findIndex(({ id }) => id === oldValues.id)
  const newEditOpenRules = [...editOpen]
  if (newSgSgIeRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newSgSgIeRules.slice(0, index), ...newSgSgIeRules.slice(index + 1)]))
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newSgSgIeRules[index] = {
      ...newSgSgIeRules[index],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newSgSgIeRules))
    toggleEditPopover(index)
  }
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>,
  oldValues: TFormSgSgIeRule,
): void => {
  const newSgSgIeRules = [...rulesAll]
  const index = newSgSgIeRules.findIndex(({ id }) => id === oldValues.id)
  newSgSgIeRules[index] = {
    ...newSgSgIeRules[index],
    formChanges: { status: STATUSES.modified },
    checked: false,
  }
  dispatch(setRules(newSgSgIeRules))
}
