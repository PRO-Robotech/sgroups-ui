import React, { FC } from 'react'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgSgFrom: FC = () => {
  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory
          title="SG From"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgSg"
          subtype="from"
          isDisabled
          inTransformBlock={false}
        />
      }
      icmpComponent={
        <RulesBlockFactory
          title="SG From"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgSgIcmp"
          subtype="from"
          inTransformBlock={false}
        />
      }
    />
  )
}
