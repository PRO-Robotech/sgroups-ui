import React, { FC, ReactNode } from 'react'
import { Layout } from 'antd'
import { Header, Menu, DefaultLayout } from 'components'
import { Styled } from './styled'

type TBaseTemplateProps = {
  children?: ReactNode | undefined
}

export const BaseTemplate: FC<TBaseTemplateProps> = ({ children }) => (
  <Styled.Container>
    <Layout>
      <Layout.Sider width={240} breakpoint="lg" collapsedWidth="0">
        <Header />
        <Styled.PositionStickyWithNoUserSelect>
          <Menu />
        </Styled.PositionStickyWithNoUserSelect>
      </Layout.Sider>
      <DefaultLayout.Layout>
        <DefaultLayout.ContentContainer>{children}</DefaultLayout.ContentContainer>
      </DefaultLayout.Layout>
    </Layout>
  </Styled.Container>
)
