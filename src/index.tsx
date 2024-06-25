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
        colorText: '#222222',
      },
      components: {
        Layout: {
          siderBg: '#F0F0F0',
        },
        Menu: {
          itemBg: '#F0F0F0',
          itemActiveBg: 'rgba(0, 0, 0, 0.06)',
          itemSelectedColor: '#222222',
          itemSelectedBg: 'rgba(0, 0, 0, 0.06)',
          subMenuItemBg: '#F0F0F0',
          iconMarginInlineEnd: 16,
        },
        Modal: {
          titleFontSize: 20,
        },
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
