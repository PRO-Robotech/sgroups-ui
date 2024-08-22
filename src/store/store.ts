import { configureStore } from '@reduxjs/toolkit'
import { themeSlice } from './theme/theme/theme'
import { sgNamesSlice } from './editor/sgNames/sgNames'
import { centerSgSlice } from './editor/centerSg/centerSg'
import { rulesSgSgSlice } from './editor/rulesSgSg/rulesSgSg'
import { rulesSgSgIcmpSlice } from './editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { rulesSgSgIeSlice } from './editor/rulesSgSgIe/rulesSgSgIe'
import { rulesSgSgIeIcmpSlice } from './editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { rulesSgFqdnSlice } from './editor/rulesSgFqdn/rulesSgFqdn'
import { rulesSgCidrSlice } from './editor/rulesSgCidr/rulesSgCidr'
import { rulesSgCidrIcmpSlice } from './editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import { searchTextSlice } from './editor/searchText/searchText'

export const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    sgNames: sgNamesSlice.reducer,
    centerSg: centerSgSlice.reducer,
    rulesSgSg: rulesSgSgSlice.reducer,
    rulesSgSgIcmp: rulesSgSgIcmpSlice.reducer,
    rulesSgSgIe: rulesSgSgIeSlice.reducer,
    rulesSgSgIeIcmp: rulesSgSgIeIcmpSlice.reducer,
    rulesSgFqdn: rulesSgFqdnSlice.reducer,
    rulesSgCidr: rulesSgCidrSlice.reducer,
    rulesSgCidrIcmp: rulesSgCidrIcmpSlice.reducer,
    searchText: searchTextSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
