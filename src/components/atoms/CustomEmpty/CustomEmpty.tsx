import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Styled } from './styled'

export const CustomEmpty: FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme)

  return (
    <Styled.Container>
      <Styled.Icon $isDark={theme === 'dark'} />
      <Styled.Text $isDark={theme === 'dark'}>No data</Styled.Text>
    </Styled.Container>
  )
}
