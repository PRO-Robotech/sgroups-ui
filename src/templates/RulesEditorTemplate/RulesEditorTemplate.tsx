import React, { FC, ReactNode, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Menu } from 'antd'
import { Header } from 'components'
import { mainPageLeftList } from 'mocks'
import { Styled } from './styled'

type TRulesEditorTemplateProps = {
  children?: ReactNode | undefined
}

export const RulesEditorTemplate: FC<TRulesEditorTemplateProps> = ({ children }) => {
  const history = useHistory()
  const [currentSection, setCurrentSection] = useState<string>('')

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
          expandIcon={null}
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
