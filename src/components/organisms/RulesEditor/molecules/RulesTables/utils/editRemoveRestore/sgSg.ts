import { Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload, Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import { STATUSES } from 'constants/rules'
import { TFormSgSgRule } from 'localTypes/rules'
import { getModifiedFieldsInSgSgRule } from './getModifiedFields'
import { findSgSgPair } from './legacyFindPair'

/* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
export const edit = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgRule[]>,
  rulesOtherside: TFormSgSgRule[],
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>,
  centerSg: string | undefined,
  oldValues: TFormSgSgRule,
  values: TFormSgSgRule,
  toggleEditPopover: (index: number) => void,
): void => {
  const newSgRules = [...rulesAll]
  const index = newSgRules.findIndex(({ id }) => id === oldValues.id)
  const newSgRulesOtherside = [...rulesOtherside]
  /* legacy */
  const newSgRulesOthersideIndex = findSgSgPair(centerSg, newSgRules[index], rulesOtherside)
  if (newSgRules[index].formChanges?.status === STATUSES.new) {
    newSgRules[index] = { ...values, formChanges: { status: STATUSES.new } }
    newSgRulesOtherside[newSgRulesOthersideIndex] = { ...values, formChanges: { status: STATUSES.new } }
  } else {
    const modifiedFields = getModifiedFieldsInSgSgRule(newSgRules[index], values)
    if (modifiedFields.length === 0) {
      newSgRules[index] = { ...values }
      newSgRulesOtherside[newSgRulesOthersideIndex] = { ...values }
    } else {
      newSgRules[index] = { ...values, formChanges: { status: STATUSES.modified, modifiedFields } }
      newSgRulesOtherside[newSgRulesOthersideIndex] = {
        ...values,
        formChanges: { status: STATUSES.modified, modifiedFields },
      }
    }
  }
  dispatch(setRules(newSgRules))
  dispatch(setRulesOtherside(newSgRulesOtherside))
  toggleEditPopover(index)
}

/* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
export const remove = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgRule[]>,
  rulesOtherside: TFormSgSgRule[],
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>,
  centerSg: string | undefined,
  oldValues: TFormSgSgRule,
  editOpen: boolean[],
  setEditOpen: Dispatch<SetStateAction<boolean[]>>,
  toggleEditPopover: (index: number) => void,
): void => {
  const newSgRules = [...rulesAll]
  const index = newSgRules.findIndex(({ id }) => id === oldValues.id)
  const newSgRulesOtherside = [...rulesOtherside]
  /* legacy */
  const newSgRulesOthersideIndex = rulesOtherside.findIndex(
    ({ sg, portsSource, portsDestination, transport, logs, action, prioritySome }) =>
      sg === centerSg &&
      portsSource === newSgRules[index].portsSource &&
      portsDestination === newSgRules[index].portsDestination &&
      transport === newSgRules[index].transport &&
      logs === newSgRules[index].logs &&
      action === newSgRules[index].action &&
      prioritySome === newSgRules[index].prioritySome,
  )
  const newEditOpenRules = [...editOpen]
  if (newSgRules[index].formChanges?.status === STATUSES.new) {
    dispatch(setRules([...newSgRules.slice(0, index), ...newSgRules.slice(index + 1)]))
    dispatch(
      setRulesOtherside([
        ...newSgRulesOtherside.slice(0, newSgRulesOthersideIndex),
        ...newSgRulesOtherside.slice(newSgRulesOthersideIndex + 1),
      ]),
    )
    toggleEditPopover(index)
    setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
  } else {
    newSgRules[index] = { ...newSgRules[index], formChanges: { status: STATUSES.deleted } }
    newSgRulesOtherside[newSgRulesOthersideIndex] = {
      ...newSgRulesOtherside[newSgRulesOthersideIndex],
      formChanges: { status: STATUSES.deleted },
    }
    dispatch(setRules(newSgRules))
    dispatch(setRulesOtherside(newSgRulesOtherside))
    toggleEditPopover(index)
  }
}

/* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
export const restore = (
  dispatch: ReduxDispatch,
  rulesAll: TFormSgSgRule[],
  setRules: ActionCreatorWithPayload<TFormSgSgRule[]>,
  rulesOtherside: TFormSgSgRule[],
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>,
  centerSg: string | undefined,
  oldValues: TFormSgSgRule,
): void => {
  const newSgRules = [...rulesAll]
  const index = newSgRules.findIndex(({ id }) => id === oldValues.id)
  const newSgRulesOtherside = [...rulesOtherside]
  /* legacy */
  const newSgRulesOthersideIndex = rulesOtherside.findIndex(
    ({ sg, portsSource, portsDestination, transport, logs, action, prioritySome }) =>
      sg === centerSg &&
      portsSource === newSgRules[index].portsSource &&
      portsDestination === newSgRules[index].portsDestination &&
      transport === newSgRules[index].transport &&
      logs === newSgRules[index].logs &&
      action === newSgRules[index].action &&
      prioritySome === newSgRules[index].prioritySome,
  )
  newSgRules[index] = { ...newSgRules[index], formChanges: { status: STATUSES.modified }, checked: false }
  newSgRulesOtherside[newSgRulesOthersideIndex] = {
    ...newSgRulesOtherside[newSgRulesOthersideIndex],
    formChanges: { status: STATUSES.modified },
    checked: false,
  }
  dispatch(setRules(newSgRules))
  dispatch(setRulesOtherside(newSgRulesOtherside))
}
