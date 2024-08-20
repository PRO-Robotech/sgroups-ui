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
  openNotification: (value: string) => void,
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
      id: oldValues.id,
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
        id: oldValues.id,
      }
    } else {
      newSgSgIeIcmpRules[index] = {
        ...newSgSgIeIcmpRules[index].initialValues,
        initialValues: { ...newSgSgIeIcmpRules[index].initialValues },
        formChanges: undefined,
        id: oldValues.id,
      }
    }
  }
  dispatch(setRules(newSgSgIeIcmpRules))
  openNotification('Changes Saved')
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>,
  oldValues: TFormSgSgIeIcmpRule,
  openNotification: (value: string) => void,
): void => {
  const newSgSgIeIcmpRules = [...rulesAll]
  const index = newSgSgIeIcmpRules.findIndex(({ id }) => id === oldValues.id)
  if (newSgSgIeIcmpRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newSgSgIeIcmpRules.slice(0, index), ...newSgSgIeIcmpRules.slice(index + 1)]))
  } else {
    newSgSgIeIcmpRules[index] = {
      ...newSgSgIeIcmpRules[index],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newSgSgIeIcmpRules))
  }
  openNotification('Rule Deleted')
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>,
  oldValues: TFormSgSgIeIcmpRule,
  openNotification: (value: string) => void,
): void => {
  const newSgSgIeIcmpRules = [...rulesAll]
  const index = newSgSgIeIcmpRules.findIndex(({ id }) => id === oldValues.id)
  const values = newSgSgIeIcmpRules[index]
  newSgSgIeIcmpRules[index] = {
    ...values,
    checked: false,
    formChanges: undefined,
  }
  if (values.formChanges && values.formChanges.modifiedFields && values.formChanges.modifiedFields.length > 0) {
    newSgSgIeIcmpRules[index] = {
      ...newSgSgIeIcmpRules[index],
      formChanges: {
        status: STATUSES.modified,
        modifiedFields: values.formChanges?.modifiedFields,
      },
    }
  }
  dispatch(setRules(newSgSgIeIcmpRules))
  openNotification('Rule Restored')
}
