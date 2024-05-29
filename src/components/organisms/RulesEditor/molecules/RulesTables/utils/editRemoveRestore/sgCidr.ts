import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgCidrRule, TTraffic } from 'localTypes/rules'
import { getModifiedFieldsInSgCidrRule } from './getModifiedFields'
import { getNumberedPriorty } from './getNumberedPriority'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>,
  defaultTraffic: TTraffic,
  oldValues: TFormSgCidrRule,
  values: Omit<TFormSgCidrRule, 'prioritySome'> & { prioritySome?: number | string },
  toggleEditPopover: (index: number) => void,
): void => {
  const numberedPriorty = getNumberedPriorty(values.prioritySome)
  const newCidrSgRules = [...rulesAll]
  const index = newCidrSgRules.findIndex(({ id }) => id === oldValues.id)
  if (newCidrSgRules[index].formChanges?.status === STATUSES.new) {
    newCidrSgRules[index] = {
      ...values,
      traffic: defaultTraffic,
      initialValues: oldValues.initialValues,
      prioritySome: numberedPriorty,
      formChanges: { status: STATUSES.new },
      id: oldValues.id,
    }
  } else {
    const modifiedFields = getModifiedFieldsInSgCidrRule(newCidrSgRules[index], {
      ...values,
      prioritySome: numberedPriorty,
    })
    if (modifiedFields.length !== 0) {
      newCidrSgRules[index] = {
        ...values,
        traffic: defaultTraffic,
        initialValues: oldValues.initialValues,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.modified, modifiedFields },
        id: oldValues.id,
      }
    } else {
      newCidrSgRules[index] = {
        ...newCidrSgRules[index].initialValues,
        initialValues: { ...newCidrSgRules[index].initialValues },
        formChanges: undefined,
        id: oldValues.id,
      }
    }
  }
  dispatch(setRules(newCidrSgRules))
  toggleEditPopover(index)
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>,
  oldValues: TFormSgCidrRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newCidrSgRules = [...rulesAll]
  const index = newCidrSgRules.findIndex(({ id }) => id === oldValues.id)
  const newEditOpenRules = [...editOpen]
  if (newCidrSgRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newCidrSgRules.slice(0, index), ...newCidrSgRules.slice(index + 1)]))
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newCidrSgRules[index] = {
      ...newCidrSgRules[index],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newCidrSgRules))
    toggleEditPopover(index)
  }
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>,
  oldValues: TFormSgCidrRule,
): void => {
  const newCidrSgRules = [...rulesAll]
  const index = newCidrSgRules.findIndex(({ id }) => id === oldValues.id)
  newCidrSgRules[index] = {
    ...newCidrSgRules[index],
    formChanges: { status: STATUSES.modified },
    checked: false,
  }
  dispatch(setRules(newCidrSgRules))
}
