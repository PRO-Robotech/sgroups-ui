import React, { FC } from 'react'
import { GroupRulesNodeWrapper } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgSgTcpUdpFrom: FC = () => {
  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory
        {...RULES_CONFIGS_FOR_FACTORY.sgSg.from}
        addpopoverPosition="top"
        inTransformBlock={false}
        isDisabledDefault
      />
    </GroupRulesNodeWrapper>
  )
}
