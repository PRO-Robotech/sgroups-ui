import React, { FC } from 'react'
import { GroupRulesNodeWrapper } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgCidrIcmpTo: FC = () => {
  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory
        {...RULES_CONFIGS_FOR_FACTORY.sgCidrIcmp.to}
        addpopoverPosition="top"
        inTransformBlock={false}
      />
    </GroupRulesNodeWrapper>
  )
}
