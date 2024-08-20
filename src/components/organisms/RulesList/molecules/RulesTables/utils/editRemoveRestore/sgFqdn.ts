import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgFqdnRule } from 'localTypes/rules'
import { getModifiedFieldsInSgFqdnRule } from './getModifiedFields'
import { getNumberedPriorty } from './getNumberedPriority'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgFqdnRule[],
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>,
  oldValues: TFormSgFqdnRule,
  values: Omit<TFormSgFqdnRule, 'prioritySome'> & { prioritySome?: number | string },
  openNotification: (value: string) => void,
): void => {
  const numberedPriorty = getNumberedPriorty(values.prioritySome)
  const newFqdnRules = [...rulesAll]
  const index = newFqdnRules.findIndex(({ id }) => id === oldValues.id)
  if (newFqdnRules[index].formChanges?.status === STATUSES.new) {
    newFqdnRules[index] = {
      ...values,
      initialValues: oldValues.initialValues,
      prioritySome: numberedPriorty,
      formChanges: { status: STATUSES.new },
      id: oldValues.id,
    }
  } else {
    const modifiedFields = getModifiedFieldsInSgFqdnRule(newFqdnRules[index], {
      ...values,
      prioritySome: numberedPriorty,
    })
    if (modifiedFields.length !== 0) {
      newFqdnRules[index] = {
        ...values,
        initialValues: oldValues.initialValues,
        prioritySome: numberedPriorty,
        formChanges: { status: STATUSES.modified, modifiedFields },
        id: oldValues.id,
      }
    } else {
      newFqdnRules[index] = {
        ...newFqdnRules[index].initialValues,
        initialValues: { ...newFqdnRules[index].initialValues },
        formChanges: undefined,
        id: oldValues.id,
      }
    }
  }
  dispatch(setRules(newFqdnRules))
  openNotification('Changes Saved')
}

export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgFqdnRule[],
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>,
  oldValues: TFormSgFqdnRule,
  openNotification: (value: string) => void,
): void => {
  const newFqdnRules = [...rulesAll]
  const index = newFqdnRules.findIndex(({ id }) => id === oldValues.id)
  if (newFqdnRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newFqdnRules.slice(0, index), ...newFqdnRules.slice(index + 1)]))
  } else {
    newFqdnRules[index] = { ...newFqdnRules[index], formChanges: { status: STATUSES.deleted } }
    dispatch(setRules(newFqdnRules))
  }
  openNotification('Rule Deleted')
}

export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgFqdnRule[],
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>,
  oldValues: TFormSgFqdnRule,
  openNotification: (value: string) => void,
): void => {
  const newFqdnRules = [...rulesAll]
  const index = newFqdnRules.findIndex(({ id }) => id === oldValues.id)
  const values = newFqdnRules[index]
  newFqdnRules[index] = {
    ...values,
    checked: false,
    formChanges: undefined,
  }
  if (values.formChanges && values.formChanges.modifiedFields && values.formChanges.modifiedFields.length > 0) {
    newFqdnRules[index] = {
      ...newFqdnRules[index],
      formChanges: {
        status: STATUSES.modified,
        modifiedFields: values.formChanges?.modifiedFields,
      },
    }
  }
  dispatch(setRules(newFqdnRules))
  openNotification('Rule Restored')
}
