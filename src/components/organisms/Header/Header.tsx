import React, { FC } from 'react'
import { BASEPREFIX } from 'constants/basePrefix'
import { Styled } from './styled'

export const Header: FC = () => (
  <Styled.Container>
    <Styled.Link href={`${BASEPREFIX}/`}>
      <Styled.Heading>Swarm Client Platform</Styled.Heading>
    </Styled.Link>
  </Styled.Container>
)
