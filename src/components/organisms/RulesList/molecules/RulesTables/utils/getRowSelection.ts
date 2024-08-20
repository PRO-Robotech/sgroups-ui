import { Key, Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import type { Dispatch as ReduxDispatch } from '@reduxjs/toolkit'
import type { TableRowSelection } from 'antd/es/table/interface'

export const getRowSelection = <S extends { id: string }, T extends S & { key: string }>(
  dispatch: ReduxDispatch,
  isChangesMode: boolean,
  selectedRowKeys: Key[],
  dataSource: T[],
  setRules: ActionCreatorWithPayload<S[]>,
  rulesAll: S[],
  setSelectedRowKeys: Dispatch<SetStateAction<Key[]>>,
): TableRowSelection<T> | undefined => {
  return isChangesMode
    ? undefined
    : {
        selectedRowKeys,
        type: 'checkbox',
        onChange: newSelectedRowKeys => {
          const newRules = [...rulesAll]
          const uncheckedKeys = selectedRowKeys.filter(el => !newSelectedRowKeys.includes(el))
          const checkedIndexes = dataSource
            .filter(({ key }) => newSelectedRowKeys.includes(key))
            .map(newRow => rulesAll.findIndex(({ id }) => id === newRow.id))
          const uncheckedIndexes = dataSource
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow => rulesAll.findIndex(({ id }) => id === newRow.id))
          checkedIndexes.forEach(
            // eslint-disable-next-line no-return-assign
            checkedIndex => (newRules[checkedIndex] = { ...newRules[checkedIndex], checked: true }),
          )
          uncheckedIndexes.forEach(
            // eslint-disable-next-line no-return-assign
            uncheckedIndex => (newRules[uncheckedIndex] = { ...newRules[uncheckedIndex], checked: false }),
          )
          dispatch(setRules(newRules))
          setSelectedRowKeys(newSelectedRowKeys)
        },
        onSelect: (record: T & { id: string; key: string }, selected: boolean) => {
          const newRules = [...rulesAll]
          const pendingToCheckRuleIndex = newRules.findIndex(({ id }) => id === record.id)
          if (selected) {
            newRules[pendingToCheckRuleIndex] = { ...newRules[pendingToCheckRuleIndex], checked: true }
          } else {
            newRules[pendingToCheckRuleIndex] = { ...newRules[pendingToCheckRuleIndex], checked: false }
          }
          dispatch(setRules(newRules))
        },
        // columnWidth: 16,
      }
}
