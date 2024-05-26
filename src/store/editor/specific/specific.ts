/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type TState = {
  specificOpen: boolean
  specificValue?: string
}

const initialState: TState = {
  specificOpen: false,
}

export const specificSlice = createSlice({
  name: 'specific',
  initialState,
  reducers: {
    setSpecific: (state, action: PayloadAction<{ specificOpen: boolean; specificValue?: string }>) => {
      state.specificOpen = action.payload.specificOpen
      state.specificValue = action.payload.specificValue
    },
  },
})

export const { setSpecific } = specificSlice.actions
