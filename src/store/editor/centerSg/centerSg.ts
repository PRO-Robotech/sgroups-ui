/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type TState = {
  centerSg?: string
}

const initialState: TState = {
  centerSg: undefined,
}

export const centerSgSlice = createSlice({
  name: 'centerSg',
  initialState,
  reducers: {
    setCenterSg: (state, action: PayloadAction<string | undefined>) => {
      state.centerSg = action.payload
    },
  },
})

export const { setCenterSg } = centerSgSlice.actions
