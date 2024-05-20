import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgCidrIcmpRule, TTraffic } from 'localTypes/rules'
import { getModifiedFieldsInSgCidrIcmpRule } from '../../utils'

export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgCidrIcmpRule[],
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>,
  defaultTraffic: TTraffic,
  oldValues: TFormSgCidrIcmpRule,
  values: TFormSgCidrIcmpRule,
  toggleEditPopover: (index: number) => void,
): void => {
  const newRules = [...rulesAll]
  const index = newRules.findIndex(({ id }) => id === oldValues.id)
  if (newRules[index].formChanges?.status === STATUSES.new) {
    newRules[index] = { ...values, traffic: defaultTraffic, formChanges: { status: STATUSES.new } }
  } else {
    const modifiedFields = getModifiedFieldsInSgCidrIcmpRule(newRules[index], values)
    if (modifiedFields.length === 0) {
      newRules[index] = { ...values }
    } else {
      newRules[index] = {
        ...values,
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.modified, modifiedFields },
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
  defaultTraffic: TTraffic,
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
      traffic: defaultTraffic,
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
  defaultTraffic: TTraffic,
  oldValues: TFormSgCidrIcmpRule,
): void => {
  const newCidrSgIcmpRules = [...rulesAll]
  const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
  newCidrSgIcmpRules[index] = {
    ...newCidrSgIcmpRules[index],
    traffic: defaultTraffic,
    formChanges: { status: STATUSES.modified },
    checked: false,
  }
  dispatch(setRules(newCidrSgIcmpRules))
}
