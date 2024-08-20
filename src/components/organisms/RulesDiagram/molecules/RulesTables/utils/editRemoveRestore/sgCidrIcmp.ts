import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgCidrIcmpRule, TTraffic } from 'localTypes/rules'
import { getModifiedFieldsInSgCidrIcmpRule } from './getModifiedFields'
import { getNumberedPriorty } from './getNumberedPriority'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>,
  defaultTraffic: TTraffic,
  oldValues: TFormSgCidrIcmpRule,
  values: Omit<TFormSgCidrIcmpRule, 'prioritySome'> & { prioritySome?: number | string },
  toggleEditPopover: (index: number) => void,
): void => {
  const numberedPriorty = getNumberedPriorty(values.prioritySome)
  const newRules = [...rulesAll]
  const index = newRules.findIndex(({ id }) => id === oldValues.id)
  if (newRules[index].formChanges?.status === STATUSES.new) {
    newRules[index] = {
      ...values,
      traffic: defaultTraffic,
      initialValues: oldValues.initialValues,
      prioritySome: numberedPriorty,
      formChanges: { status: STATUSES.new },
      id: oldValues.id,
    }
  } else {
    const modifiedFields = getModifiedFieldsInSgCidrIcmpRule(newRules[index], {
      ...values,
      prioritySome: numberedPriorty,
    })
    if (modifiedFields.length !== 0) {
      newRules[index] = {
        ...values,
        traffic: defaultTraffic,
        initialValues: oldValues.initialValues,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.modified, modifiedFields },
        id: oldValues.id,
      }
    } else {
      newRules[index] = {
        ...newRules[index].initialValues,
        initialValues: { ...newRules[index].initialValues },
        formChanges: undefined,
        id: oldValues.id,
      }
    }
  }
  dispatch(setRules(newRules))
  toggleEditPopover(index)
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>,
  oldValues: TFormSgCidrIcmpRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newCidrSgIcmpRules = [...rulesAll]
  const newEditOpenRules = [...editOpen]
  const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  if (newCidrSgIcmpRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newCidrSgIcmpRules.slice(0, index), ...newCidrSgIcmpRules.slice(index + 1)]))
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newCidrSgIcmpRules[index] = {
      ...newCidrSgIcmpRules[index],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newCidrSgIcmpRules))
    toggleEditPopover(index)
  }
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>,
  oldValues: TFormSgCidrIcmpRule,
): void => {
  const newCidrSgIcmpRules = [...rulesAll]
  const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  const values = newCidrSgIcmpRules[index]
  newCidrSgIcmpRules[index] = {
    ...values,
    checked: false,
    formChanges: undefined,
  }
  if (values.formChanges && values.formChanges.modifiedFields && values.formChanges.modifiedFields.length > 0) {
    newCidrSgIcmpRules[index] = {
      ...newCidrSgIcmpRules[index],
      formChanges: {
        status: STATUSES.modified,
        modifiedFields: values.formChanges?.modifiedFields,
      },
    }
  }
  dispatch(setRules(newCidrSgIcmpRules))
}
