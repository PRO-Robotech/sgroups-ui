import React, { FC } from 'react'
import { SelectCenterSg } from '../../molecules'
import { SgSgFrom, SgSgTo, SgSgIeFrom, SgSgIeTo, SgFqdnTo, SgCidrFrom, SgCidrTo } from '../RulesSpecific/organisms'
import { Styled } from './styled'

type TRulesSimplifiedProps = {
  onSelectCenterSg: (value?: string) => void
}

export const RulesSimplified: FC<TRulesSimplifiedProps> = ({ onSelectCenterSg }) => {
  return (
    <Styled.Container>
      <SelectCenterSg onSelectCenterSg={onSelectCenterSg} notInTransformBlock />
      <SgSgFrom />
      <SgSgIeFrom />
      <SgCidrFrom />
      <SgSgTo />
      <SgSgIeTo />
      <SgFqdnTo />
      <SgCidrTo />
    </Styled.Container>
  )
}
