/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type TState = {
  sgNames: string[]
}

const initialState: TState = {
  sgNames: [],
}

export const sgNamesSlice = createSlice({
  name: 'sgNames',
  initialState,
  reducers: {
    addSgName: (state, action: PayloadAction<string>) => {
      state.sgNames.push(action.payload)
    },
    setSgNames: (state, action: PayloadAction<string[]>) => {
      state.sgNames = action.payload
    },
  },
})

export const { addSgName, setSgNames } = sgNamesSlice.actions
