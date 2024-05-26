import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgSgIeFrom: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory
          title="SG-SG-IE From"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgSgIe"
          subtype="from"
          isDisabled={!centerSg}
          inTransformBlock={false}
        />
      }
      icmpComponent={
        <RulesBlockFactory
          title="SG-SG-IE From"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgSgIeIcmp"
          subtype="from"
          isDisabled={!centerSg}
          inTransformBlock={false}
        />
      }
    />
  )
}
