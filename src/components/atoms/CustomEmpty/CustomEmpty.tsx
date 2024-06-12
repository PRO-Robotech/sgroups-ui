import React, { FC } from 'react'
import { Styled } from './styled'

export const CustomEmpty: FC = () => (
  <Styled.Container>
    <Styled.Icon />
    <Styled.Text>No data</Styled.Text>
  </Styled.Container>
)
