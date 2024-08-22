import React, { FC, useEffect } from 'react'
import { Switch } from 'antd'
import { Moon } from '@phosphor-icons/react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from 'store/store'
import { setTheme } from 'store/theme/theme/theme'
import { Styled } from './styled'

export const ThemeSelector: FC = () => {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.theme)

  useEffect(() => {
    const localStorageTheme = localStorage.getItem('theme')
    if (localStorageTheme && (localStorageTheme === 'dark' || localStorageTheme === 'light')) {
      dispatch(setTheme(localStorageTheme))
    } else {
      localStorage.setItem('theme', 'light')
      dispatch(setTheme('light'))
    }
  }, [dispatch])

  const updateTheme = (checked: boolean) => {
    if (checked) {
      localStorage.setItem('theme', 'dark')
      dispatch(setTheme('dark'))
    } else {
      localStorage.setItem('theme', 'light')
      dispatch(setTheme('light'))
    }
  }

  return (
    <Styled.Container>
      <Moon size="24" />
      <Styled.Text>Dark theme</Styled.Text>
      <Styled.SwitchContainer>
        <Switch value={theme === 'dark'} onChange={checked => updateTheme(checked)} />
      </Styled.SwitchContainer>
    </Styled.Container>
  )
}
