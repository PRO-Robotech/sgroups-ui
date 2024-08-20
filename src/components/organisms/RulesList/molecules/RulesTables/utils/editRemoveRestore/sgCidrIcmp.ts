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
  openNotification: (value: string) => void,
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
  openNotification('Changes Saved')
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>,
  oldValues: TFormSgCidrIcmpRule,
  openNotification: (value: string) => void,
): void => {
  const newCidrSgIcmpRules = [...rulesAll]
  const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  if (newCidrSgIcmpRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newCidrSgIcmpRules.slice(0, index), ...newCidrSgIcmpRules.slice(index + 1)]))
  } else {
    newCidrSgIcmpRules[index] = {
      ...newCidrSgIcmpRules[index],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newCidrSgIcmpRules))
  }
  openNotification('Rule Deleted')
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>,
  oldValues: TFormSgCidrIcmpRule,
  openNotification: (value: string) => void,
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
  openNotification('Rule Restored')
}
