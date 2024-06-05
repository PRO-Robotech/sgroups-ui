import React, { FC } from 'react'
import { TcpUdpAndIcmpSwitcher } from '../../../atoms'
import { RulesBlockFactory } from '../../../organisms'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../constants'

export const SgCidrFrom: FC = () => {
  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory
          {...RULES_CONFIGS_FOR_FACTORY.sgCidr.from}
          addpopoverPosition="top"
          inTransformBlock={false}
        />
      }
      icmpComponent={
        <RulesBlockFactory
          {...RULES_CONFIGS_FOR_FACTORY.sgCidrIcmp.from}
          addpopoverPosition="top"
          inTransformBlock={false}
        />
      }
    />
  )
}
