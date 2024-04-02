import React, { FC, ReactNode, useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { BaseTemplate } from 'templates'
import { DefaultLayout, PositionSticky } from 'components'
import { mainPageLeftList } from 'mocks'

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
          <PositionSticky>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[currentSection]}
              items={mainPageLeftList}
              onClick={({ key }) => {
                history.push(key)
                setCurrentSection(key)
              }}
            />
          </PositionSticky>
        </Layout.Sider>
        <DefaultLayout.LayoutWithPadding>
          <DefaultLayout.ContentContainer>{children}</DefaultLayout.ContentContainer>
        </DefaultLayout.LayoutWithPadding>
      </Layout>
    </BaseTemplate>
  )
}
