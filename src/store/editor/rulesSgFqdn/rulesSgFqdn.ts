/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TFormSgFqdnRule } from 'localTypes/rules'

export type TState = {
  rulesTo: TFormSgFqdnRule[]
}

const initialState: TState = {
  rulesTo: [],
}

export const rulesSgFqdnSlice = createSlice({
  name: 'rulesSgFqdn',
  initialState,
  reducers: {
    addRulesSgFqdnTo: (state, action: PayloadAction<TFormSgFqdnRule>) => {
      state.rulesTo.push(action.payload)
    },
    setRulesSgFqdnTo: (state, action: PayloadAction<TFormSgFqdnRule[]>) => {
      state.rulesTo = action.payload
    },
  },
})

export const { addRulesSgFqdnTo, setRulesSgFqdnTo } = rulesSgFqdnSlice.actions
