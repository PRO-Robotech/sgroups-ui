import React, { FC } from 'react'
import { TcpUdpAndIcmpSwitcher } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgSgTo: FC = () => {
  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSg.to} addpopoverPosition="top" inTransformBlock={false} />
      }
      icmpComponent={
        <RulesBlockFactory
          {...RULES_CONFIGS_FOR_FACTORY.sgSgIcmp.to}
          addpopoverPosition="top"
          inTransformBlock={false}
        />
      }
    />
  )
}
