import React, { FC, ReactNode } from 'react'
import { Header, Menu, DefaultLayout } from 'components'
import { Styled } from './styled'

type TRulesEditorTemplateProps = {
  children?: ReactNode | undefined
}

export const RulesEditorTemplate: FC<TRulesEditorTemplateProps> = ({ children }) => (
  <>
    <Styled.SidebarContainer>
      <Header />
      <Menu />
    </Styled.SidebarContainer>
    <DefaultLayout.Layout>{children}</DefaultLayout.Layout>
  </>
)
