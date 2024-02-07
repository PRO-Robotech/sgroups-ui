import React, { FC, ReactNode } from 'react'
import { Header } from 'components'
import { Styled } from './styled'

type TBaseTemplateProps = {
  children?: ReactNode | undefined
}

export const BaseTemplate: FC<TBaseTemplateProps> = ({ children }) => (
  <Styled.Container>
    <Header />
    {children}
  </Styled.Container>
)
