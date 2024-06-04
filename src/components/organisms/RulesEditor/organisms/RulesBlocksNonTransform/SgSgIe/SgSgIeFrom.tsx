import React, { FC } from 'react'
import { TcpUdpAndIcmpSwitcher } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgSgIeFrom: FC = () => {
  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory
          {...RULES_CONFIGS_FOR_FACTORY.sgSgIe.from}
          addpopoverPosition="top"
          inTransformBlock={false}
        />
      }
      icmpComponent={
        <RulesBlockFactory
          {...RULES_CONFIGS_FOR_FACTORY.sgSgIeIcmp.from}
          addpopoverPosition="top"
          inTransformBlock={false}
        />
      }
    />
  )
}
