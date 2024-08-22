import React, { FC, ReactNode } from 'react'
import { Layout, theme as antdtheme } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Header, Menu, DefaultLayout, ThemeSelector, DefaultColorProvider } from 'components'
import { Styled } from './styled'

type TBaseTemplateProps = {
  children?: ReactNode | undefined
}

export const BaseTemplate: FC<TBaseTemplateProps> = ({ children }) => {
  const { useToken } = antdtheme
  const { token } = useToken()
  const theme = useSelector((state: RootState) => state.theme.theme)

  return (
    <DefaultColorProvider $color={token.colorText}>
      <Styled.Container $isDark={theme === 'dark'}>
        <Layout>
          <Layout.Sider width={240} breakpoint="lg" collapsedWidth="0">
            <Header />
            <Styled.PositionStickyWithNoUserSelect>
              <Menu />
            </Styled.PositionStickyWithNoUserSelect>
            <ThemeSelector />
          </Layout.Sider>
          <DefaultLayout.Layout $bgColor={token.colorBgLayout}>
            <DefaultLayout.ContentContainer>{children}</DefaultLayout.ContentContainer>
          </DefaultLayout.Layout>
        </Layout>
      </Styled.Container>
    </DefaultColorProvider>
  )
}
