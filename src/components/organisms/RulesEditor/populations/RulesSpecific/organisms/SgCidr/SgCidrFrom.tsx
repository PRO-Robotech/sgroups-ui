import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgCidrFrom: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory
          title="CIDR From"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgCidr"
          subtype="from"
          isDisabled={!centerSg}
          inTransformBlock={false}
        />
      }
      icmpComponent={
        <RulesBlockFactory
          title="CIDR From"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgCidrIcmp"
          subtype="from"
          isDisabled={!centerSg}
          inTransformBlock={false}
        />
      }
    />
  )
}
