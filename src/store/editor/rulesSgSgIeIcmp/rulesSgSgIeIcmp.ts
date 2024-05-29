/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgSgIeIcmpRule } from 'localTypes/rules'

export type TState = {
  rulesFrom: TFormSgSgIeIcmpRule[]
  rulesTo: TFormSgSgIeIcmpRule[]
}

const initialState: TState = {
  rulesFrom: [],
  rulesTo: [],
}

export const rulesSgSgIeIcmpSlice = createSlice({
  name: 'rulesSgSgIeIcmp',
  initialState,
  reducers: {
    addRulesSgSgIeIcmpFrom: (state, action: PayloadAction<TFormSgSgIeIcmpRule>) => {
      state.rulesFrom.push(action.payload)
    },
    setRulesSgSgIeIcmpFrom: (state, action: PayloadAction<TFormSgSgIeIcmpRule[]>) => {
      state.rulesFrom = action.payload
    },
    addRulesSgSgIeIcmpTo: (state, action: PayloadAction<TFormSgSgIeIcmpRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgSgIeIcmpTo: (state, action: PayloadAction<TFormSgSgIeIcmpRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpFrom, addRulesSgSgIeIcmpTo, setRulesSgSgIeIcmpTo } =
  rulesSgSgIeIcmpSlice.actions
