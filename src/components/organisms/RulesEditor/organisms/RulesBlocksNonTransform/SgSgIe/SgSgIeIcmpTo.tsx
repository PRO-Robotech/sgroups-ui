import React, { FC } from 'react'
import { GroupRulesNodeWrapper } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgSgIeIcmpTo: FC = () => {
  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory
        {...RULES_CONFIGS_FOR_FACTORY.sgSgIeIcmp.to}
        addpopoverPosition="top"
        inTransformBlock={false}
      />
    </GroupRulesNodeWrapper>
  )
}
