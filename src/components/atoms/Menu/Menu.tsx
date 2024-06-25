import React, { FC, useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { CaretUp } from '@phosphor-icons/react'
import { mainPageLeftList } from 'mocks'
import { Styled } from './styled'

export const Menu: FC = () => {
  const location = useLocation()
  const history = useHistory()
  const [currentSection, setCurrentSection] = useState<string>(`/${location.pathname.split('/')[1]}`)

  useEffect(() => {
    setCurrentSection(location.pathname)
  }, [location, history])

  return (
    <Styled.CustomMenu
      mode="inline"
      theme="light"
      selectedKeys={[currentSection]}
      defaultOpenKeys={['/rules']}
      items={mainPageLeftList}
      onClick={({ key }) => {
        history.push(key)
        setCurrentSection(key)
      }}
      expandIcon={<CaretUp size={16} />}
    />
  )
}
