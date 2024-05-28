import React, { FC, ReactNode, useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { BaseTemplate } from 'templates'
import { DefaultLayout } from 'components'
import { mainPageLeftList } from 'mocks'
import { Styled } from './styled'

type TLeftMenuTemplateProps = {
  children?: ReactNode | undefined
}

export const LeftMenuTemplate: FC<TLeftMenuTemplateProps> = ({ children }) => {
  const location = useLocation()
  const history = useHistory()
  const [currentSection, setCurrentSection] = useState<string>(`/${location.pathname.split('/')[1]}`)

  useEffect(() => {
    setCurrentSection(`/${location.pathname.split('/')[1]}`)
  }, [location, history])

  return (
    <BaseTemplate>
      <Layout>
        <Layout.Sider width={200} breakpoint="lg" collapsedWidth="0">
          <Styled.PositionStickyWithNoUserSelect>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[currentSection]}
              defaultOpenKeys={['/rules']}
              items={mainPageLeftList}
              onClick={({ key }) => {
                history.push(key)
                setCurrentSection(key)
              }}
            />
          </Styled.PositionStickyWithNoUserSelect>
        </Layout.Sider>
        <DefaultLayout.LayoutWithPadding>
          <DefaultLayout.ContentContainer>{children}</DefaultLayout.ContentContainer>
        </DefaultLayout.LayoutWithPadding>
      </Layout>
    </BaseTemplate>
  )
}
