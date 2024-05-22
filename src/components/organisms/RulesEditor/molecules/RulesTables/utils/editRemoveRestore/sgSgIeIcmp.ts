import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgSgIeIcmpRule, TTraffic } from 'localTypes/rules'
import { getModifiedFieldsInSgSgIeIcmpRule } from './getModifiedFields'
import { getNumberedPriorty } from './getNumberedPriority'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>,
  defaultTraffic: TTraffic,
  oldValues: TFormSgSgIeIcmpRule,
  values: Omit<TFormSgSgIeIcmpRule, 'prioritySome'> & { prioritySome?: number | string },
  toggleEditPopover: (index: number) => void,
): void => {
  const numberedPriorty = getNumberedPriorty(values.prioritySome)
  const newSgSgIeIcmpRules = [...rulesAll]
  const index = newSgSgIeIcmpRules.findIndex(({ id }) => id === oldValues.id)
  if (newSgSgIeIcmpRules[index].formChanges?.status === STATUSES.new) {
    newSgSgIeIcmpRules[index] = {
      ...values,
      traffic: defaultTraffic,
      initialValues: oldValues.initialValues,
      prioritySome: numberedPriorty,
      formChanges: { status: STATUSES.new },
    }
  } else {
    const modifiedFields = getModifiedFieldsInSgSgIeIcmpRule(newSgSgIeIcmpRules[index], {
      ...values,
      prioritySome: numberedPriorty,
    })
    if (modifiedFields.length !== 0) {
      newSgSgIeIcmpRules[index] = {
        ...values,
        traffic: defaultTraffic,
        initialValues: oldValues.initialValues,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.modified, modifiedFields },
      }
    } else {
      newSgSgIeIcmpRules[index] = {
        ...newSgSgIeIcmpRules[index].initialValues,
        initialValues: { ...newSgSgIeIcmpRules[index].initialValues },
        formChanges: undefined,
        id: values.id,
      }
    }
  }
  dispatch(setRules(newSgSgIeIcmpRules))
  toggleEditPopover(index)
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>,
  oldValues: TFormSgSgIeIcmpRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newSgSgIeIcmpRules = [...rulesAll]
  const newEditOpenRules = [...editOpen]
  const index = newSgSgIeIcmpRules.findIndex(({ id }) => id === oldValues.id)
  if (newSgSgIeIcmpRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newSgSgIeIcmpRules.slice(0, index), ...newSgSgIeIcmpRules.slice(index + 1)]))
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newSgSgIeIcmpRules[index] = {
      ...newSgSgIeIcmpRules[index],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newSgSgIeIcmpRules))
    toggleEditPopover(index)
  }
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>,
  oldValues: TFormSgSgIeIcmpRule,
): void => {
  const newSgSgIeIcmpRules = [...rulesAll]
  const index = newSgSgIeIcmpRules.findIndex(({ id }) => id === oldValues.id)
  newSgSgIeIcmpRules[index] = {
    ...newSgSgIeIcmpRules[index],
    formChanges: { status: STATUSES.modified },
    checked: false,
  }
  dispatch(setRules(newSgSgIeIcmpRules))
}
