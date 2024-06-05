import React, { FC } from 'react'
import { GroupRulesNodeWrapper } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgCidrTcpUdpTo: FC = () => {
  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidr.to} addpopoverPosition="top" inTransformBlock={false} />
    </GroupRulesNodeWrapper>
  )
}
