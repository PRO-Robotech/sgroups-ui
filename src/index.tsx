import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from 'store/store'
import { ConfigProvider } from 'antd'
import './index.css'
import { App } from './App'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <ConfigProvider
    theme={{
      token: {
        fontFamily: '"Lato", sans-serif',
      },
    }}
  >
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  </ConfigProvider>,
)
