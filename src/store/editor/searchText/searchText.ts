/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type TState = {
  searchText?: string
}

const initialState: TState = {
  searchText: undefined,
}

export const searchTextSlice = createSlice({
  name: 'searchText',
  initialState,
  reducers: {
    setSearchText: (state, action: PayloadAction<string | undefined>) => {
      state.searchText = action.payload
    },
  },
})

export const { setSearchText } = searchTextSlice.actions
