import React, { FC, ReactNode } from 'react'
import { theme } from 'antd'
import { Header, Menu, DefaultLayout } from 'components'
import { Styled } from './styled'

type TRulesEditorTemplateProps = {
  children?: ReactNode | undefined
}

export const RulesEditorTemplate: FC<TRulesEditorTemplateProps> = ({ children }) => {
  const { useToken } = theme
  const { token } = useToken()

  return (
    <>
      <Styled.SidebarContainer>
        <Header />
        <Menu />
      </Styled.SidebarContainer>
      <DefaultLayout.Layout $bgColor={token.colorBgLayout}>{children}</DefaultLayout.Layout>
    </>
  )
}
