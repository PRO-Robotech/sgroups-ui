import React, { FC, ReactNode, useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Menu } from 'antd'
import { Header } from 'components'
import { mainPageLeftList } from 'mocks'
import { Styled } from './styled'

type TRulesEditorTemplateProps = {
  children?: ReactNode | undefined
}

export const RulesEditorTemplate: FC<TRulesEditorTemplateProps> = ({ children }) => {
  const location = useLocation()
  const history = useHistory()
  const [currentSection, setCurrentSection] = useState<string>(`/${location.pathname.split('/')[1]}`)

  useEffect(() => {
    setCurrentSection(`/${location.pathname.split('/')[1]}`)
  }, [location, history])

  return (
    <>
      <Styled.HeaderContainer>
        <Header />
      </Styled.HeaderContainer>

      <Styled.SidebarContainer>
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
      </Styled.SidebarContainer>
      {children}
    </>
  )
}
