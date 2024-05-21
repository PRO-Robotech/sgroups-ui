/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgSgIcmpRule } from 'localTypes/rules'

export type TState = {
  rulesFrom: TFormSgSgIcmpRule[]
  rulesTo: TFormSgSgIcmpRule[]
}

const initialState: TState = {
  rulesFrom: [],
  rulesTo: [],
}

export const rulesSgSgIcmpSlice = createSlice({
  name: 'rulesSgSgIcmp',
  initialState,
  reducers: {
    addRulesSgSgIcmpFrom: (state, action: PayloadAction<TFormSgSgIcmpRule>) => {
      state.rulesFrom.push(action.payload)
    },
    setRulesSgSgIcmpFrom: (state, action: PayloadAction<TFormSgSgIcmpRule[]>) => {
      state.rulesFrom = action.payload
    },
    addRulesSgSgIcmpTo: (state, action: PayloadAction<TFormSgSgIcmpRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgSgIcmpTo: (state, action: PayloadAction<TFormSgSgIcmpRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgSgIcmpFrom, setRulesSgSgIcmpFrom, addRulesSgSgIcmpTo, setRulesSgSgIcmpTo } =
  rulesSgSgIcmpSlice.actions
