/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgSgRule } from 'localTypes/rules'

export type TState = {
  rulesFrom: TFormSgSgRule[]
  rulesTo: TFormSgSgRule[]
}

const initialState: TState = {
  rulesFrom: [],
  rulesTo: [],
}

export const rulesSgSgSlice = createSlice({
  name: 'rulesSgSg',
  initialState,
  reducers: {
    addRulesSgSgFrom: (state, action: PayloadAction<TFormSgSgRule>) => {
      state.rulesFrom.push(action.payload)
    },
    setRulesSgSgFrom: (state, action: PayloadAction<TFormSgSgRule[]>) => {
      state.rulesFrom = action.payload
    },
    addRulesSgSgTo: (state, action: PayloadAction<TFormSgSgRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgSgTo: (state, action: PayloadAction<TFormSgSgRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgSgFrom, setRulesSgSgFrom, addRulesSgSgTo, setRulesSgSgTo } = rulesSgSgSlice.actions
