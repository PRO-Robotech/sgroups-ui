/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgSgIeRule } from 'localTypes/rules'

export type TState = {
  rulesFrom: TFormSgSgIeRule[]
  rulesTo: TFormSgSgIeRule[]
}

const initialState: TState = {
  rulesFrom: [],
  rulesTo: [],
}

export const rulesSgSgIeSlice = createSlice({
  name: 'rulesSgSgIeSlice',
  initialState,
  reducers: {
    addRulesSgSgIeFrom: (state, action: PayloadAction<TFormSgSgIeRule>) => {
      state.rulesFrom.push(action.payload)
    },
    setRulesSgSgIeFrom: (state, action: PayloadAction<TFormSgSgIeRule[]>) => {
      state.rulesFrom = action.payload
    },
    addRulesSgSgIeTo: (state, action: PayloadAction<TFormSgSgIeRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgSgIeTo: (state, action: PayloadAction<TFormSgSgIeRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgSgIeFrom, setRulesSgSgIeFrom, addRulesSgSgIeTo, setRulesSgSgIeTo } = rulesSgSgIeSlice.actions
