import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from 'store/store'
import './index.css'
import { AppWrappedWithStore } from './AppWrappedWithStore'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <Provider store={store}>
    <AppWrappedWithStore />
  </Provider>,
)
