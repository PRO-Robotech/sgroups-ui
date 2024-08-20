import React, { FC, useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { CaretUp, CaretDown } from '@phosphor-icons/react'
import { mainPageLeftList } from 'mocks'
import { Styled } from './styled'

export const Menu: FC = () => {
  const location = useLocation()
  const history = useHistory()
  const [currentSection, setCurrentSection] = useState<string>(`/${location.pathname.split('/')[1]}`)

  const icon = (isOpen?: boolean) => (isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />)
  const defaultOpened = currentSection.includes('rules') ? ['/rules'] : []

  useEffect(() => {
    setCurrentSection(location.pathname)
  }, [location, history])

  return (
    <Styled.CustomMenu
      mode="inline"
      theme="light"
      selectedKeys={[currentSection]}
      items={mainPageLeftList}
      defaultOpenKeys={defaultOpened}
      onClick={({ key }) => {
        history.push(key)
        setCurrentSection(key)
      }}
      expandIcon={({ isOpen }) => icon(isOpen)}
    />
  )
}
