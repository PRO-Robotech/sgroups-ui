import React, { FC } from 'react'
import { SelectCenterSg } from '../../molecules'
import { SgSgFrom, SgSgTo, SgSgIeFrom, SgSgIeTo, SgFqdnTo, SgCidrFrom, SgCidrTo } from '../../organisms'
import { Styled } from './styled'

type TRulesSimplifiedProps = {
  onSelectCenterSg: (value?: string) => void
}

export const RulesSimplified: FC<TRulesSimplifiedProps> = ({ onSelectCenterSg }) => {
  return (
    <Styled.Container>
      <Styled.Card>
        <SelectCenterSg onSelectCenterSg={onSelectCenterSg} notInTransformBlock />
      </Styled.Card>
      <Styled.Card>
        <SgSgFrom />
      </Styled.Card>
      <Styled.Card>
        <SgSgIeFrom />
      </Styled.Card>
      <Styled.Card>
        <SgCidrFrom />
      </Styled.Card>
      <Styled.Card>
        <SgSgTo />
      </Styled.Card>
      <Styled.Card>
        <SgSgIeTo />
      </Styled.Card>
      <Styled.Card>
        <SgFqdnTo />
      </Styled.Card>
      <Styled.Card>
        <SgCidrTo />
      </Styled.Card>
    </Styled.Container>
  )
}
