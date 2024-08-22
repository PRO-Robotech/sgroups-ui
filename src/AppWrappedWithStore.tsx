import React, { FC } from 'react'
import { ConfigProvider, theme as antdtheme } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { App } from './App'

export const AppWrappedWithStore: FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme)

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdtheme.darkAlgorithm : undefined,
        token: {
          fontFamily: '"Lato", sans-serif',
          colorText: theme === 'light' ? '#222222' : '#E3E3E3',
          colorTextBase: theme === 'light' ? '#000' : '#E3E3E3',
          colorBgBase: theme === 'light' ? '#fff' : '#141414',
        },
        components: {
          Layout: {
            siderBg: theme === 'light' ? '#F9F9F9' : '#222222',
          },
          Menu: {
            itemBg: theme === 'light' ? '#F9F9F9' : '#222222',
            itemActiveBg: 'rgba(0, 0, 0, 0.06)',
            itemSelectedColor: theme === 'light' ? '#222222' : '#E3E3E3',
            itemSelectedBg: theme === 'light' ? '#E6EBF8' : '#141414',
            subMenuItemBg: theme === 'light' ? '#F9F9F9' : '#222222',
            iconMarginInlineEnd: 16,
          },
          Modal: {
            titleFontSize: 20,
          },
        },
      }}
    >
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ConfigProvider>
  )
}
