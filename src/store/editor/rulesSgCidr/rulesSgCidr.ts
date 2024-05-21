/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgCidrRule } from 'localTypes/rules'

export type TState = {
  rulesFrom: TFormSgCidrRule[]
  rulesTo: TFormSgCidrRule[]
}

const initialState: TState = {
  rulesFrom: [],
  rulesTo: [],
}

export const rulesSgCidrSlice = createSlice({
  name: 'rulesSgCidr',
  initialState,
  reducers: {
    addRulesSgCidrFrom: (state, action: PayloadAction<TFormSgCidrRule>) => {
      state.rulesFrom.push(action.payload)
    },
    setRulesSgCidrFrom: (state, action: PayloadAction<TFormSgCidrRule[]>) => {
      state.rulesFrom = action.payload
    },
    addRulesSgCidrTo: (state, action: PayloadAction<TFormSgCidrRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgCidrTo: (state, action: PayloadAction<TFormSgCidrRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgCidrFrom, setRulesSgCidrFrom, addRulesSgCidrTo, setRulesSgCidrTo } = rulesSgCidrSlice.actions
