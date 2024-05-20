/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgCidrIcmpRule } from 'localTypes/rules'

export type TState = {
  rulesFrom: TFormSgCidrIcmpRule[]
  rulesTo: TFormSgCidrIcmpRule[]
}

const initialState: TState = {
  rulesFrom: [],
  rulesTo: [],
}

export const rulesSgCidrIcmpSlice = createSlice({
  name: 'rulesSgCidrIcmp',
  initialState,
  reducers: {
    addRulesSgCidrIcmpFrom: (state, action: PayloadAction<TFormSgCidrIcmpRule>) => {
      state.rulesFrom.push(action.payload)
    },
    setRulesSgCidrIcmpFrom: (state, action: PayloadAction<TFormSgCidrIcmpRule[]>) => {
      state.rulesFrom = action.payload
    },
    addRulesSgCidrIcmpTo: (state, action: PayloadAction<TFormSgCidrIcmpRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgCidrIcmpTo: (state, action: PayloadAction<TFormSgCidrIcmpRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgCidrIcmpFrom, setRulesSgCidrIcmpFrom, addRulesSgCidrIcmpTo, setRulesSgCidrIcmpTo } =
  rulesSgCidrIcmpSlice.actions
