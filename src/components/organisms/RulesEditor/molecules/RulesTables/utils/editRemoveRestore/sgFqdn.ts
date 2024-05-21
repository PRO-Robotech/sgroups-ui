import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgFqdnRule } from 'localTypes/rules'
import { getModifiedFieldsInSgFqdnRule } from './getModifiedFields'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgFqdnRule[],
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>,
  oldValues: TFormSgFqdnRule,
  values: TFormSgFqdnRule,
  toggleEditPopover: (index: number) => void,
): void => {
  const newFqdnRules = [...rulesAll]
  const index = newFqdnRules.findIndex(({ id }) => id === oldValues.id)
  if (newFqdnRules[index].formChanges?.status === STATUSES.new) {
    newFqdnRules[index] = { ...values, formChanges: { status: STATUSES.new } }
  } else {
    const modifiedFields = getModifiedFieldsInSgFqdnRule(newFqdnRules[index], values)
    if (modifiedFields.length === 0) {
      newFqdnRules[index] = { ...values }
    } else {
      newFqdnRules[index] = { ...values, formChanges: { status: STATUSES.modified, modifiedFields } }
    }
  }
  dispatch(setRules(newFqdnRules))
  toggleEditPopover(index)
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgFqdnRule[],
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>,
  oldValues: TFormSgFqdnRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newFqdnRules = [...rulesAll]
  const index = newFqdnRules.findIndex(({ id }) => id === oldValues.id)
  const newEditOpenRules = [...editOpen]
  if (newFqdnRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newFqdnRules.slice(0, index), ...newFqdnRules.slice(index + 1)]))
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newFqdnRules[index] = { ...newFqdnRules[index], formChanges: { status: STATUSES.deleted } }
    dispatch(setRules(newFqdnRules))
    toggleEditPopover(index)
  }
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgFqdnRule[],
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>,
  oldValues: TFormSgFqdnRule,
): void => {
  const newFqdnRules = [...rulesAll]
  const index = newFqdnRules.findIndex(({ id }) => id === oldValues.id)
  newFqdnRules[index] = { ...newFqdnRules[index], formChanges: { status: STATUSES.modified }, checked: false }
  dispatch(setRules(newFqdnRules))
}
