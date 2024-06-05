import React, { FC } from 'react'
import { GroupRulesNodeWrapper } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgSgIeTcpUdpFrom: FC = () => {
  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIe.from} addpopoverPosition="top" inTransformBlock={false} />
    </GroupRulesNodeWrapper>
  )
}
