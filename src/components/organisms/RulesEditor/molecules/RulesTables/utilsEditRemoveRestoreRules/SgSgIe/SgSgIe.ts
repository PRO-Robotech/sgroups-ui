import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgSgIeRule, TTraffic } from 'localTypes/rules'
import { getModifiedFieldsInSgSgIeRule } from '../../utils'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgIeRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>,
  defaultTraffic: TTraffic,
  oldValues: TFormSgSgIeRule,
  values: TFormSgSgIeRule,
  toggleEditPopover: (index: number) => void,
): void => {
  const newSgSgIeRules = [...rulesAll]
  const index = newSgSgIeRules.findIndex(({ id }) => id === oldValues.id)
  if (newSgSgIeRules[index].formChanges?.status === STATUSES.new) {
    newSgSgIeRules[index] = { ...values, traffic: defaultTraffic, formChanges: { status: STATUSES.new } }
  } else {
    const modifiedFields = getModifiedFieldsInSgSgIeRule(newSgSgIeRules[index], values)
    if (modifiedFields.length === 0) {
      newSgSgIeRules[index] = { ...values }
    } else {
      newSgSgIeRules[index] = {
        ...values,
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.modified, modifiedFields },
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
  defaultTraffic: TTraffic,
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
      traffic: defaultTraffic,
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
  defaultTraffic: TTraffic,
  oldValues: TFormSgSgIeRule,
): void => {
  const newSgSgIeRules = [...rulesAll]
  const index = newSgSgIeRules.findIndex(({ id }) => id === oldValues.id)
  newSgSgIeRules[index] = {
    ...newSgSgIeRules[index],
    traffic: defaultTraffic,
    formChanges: { status: STATUSES.modified },
    checked: false,
  }
  dispatch(setRules(newSgSgIeRules))
}
