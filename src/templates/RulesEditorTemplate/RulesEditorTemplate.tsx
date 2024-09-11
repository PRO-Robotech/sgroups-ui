import React, { FC, ReactNode } from 'react'
// import { theme } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Header, Menu, DefaultLayout } from 'components'
import { Styled } from './styled'

type TRulesEditorTemplateProps = {
  children?: ReactNode | undefined
}

export const RulesEditorTemplate: FC<TRulesEditorTemplateProps> = ({ children }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)
  // const { useToken } = theme
  // const { token } = useToken()

  return (
    <>
      <Styled.SidebarContainer>
        <Header />
        <Menu />
      </Styled.SidebarContainer>
      {/* <DefaultLayout.Layout $bgColor={token.colorBgLayout}> */}
      <DefaultLayout.Layout $bgColor={theme === 'dark' ? '#141414' : '#fff'}>{children}</DefaultLayout.Layout>
    </>
  )
}
