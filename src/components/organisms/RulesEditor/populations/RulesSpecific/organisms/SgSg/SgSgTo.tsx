import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgSgTo: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  return (
    <TcpUdpAndIcmpSwitcher
      notInTransformBlock
      tcpUdpComponent={
        <RulesBlockFactory
          title="SG To"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgSg"
          subtype="to"
          isDisabled={!centerSg}
          inTransformBlock={false}
        />
      }
      icmpComponent={
        <RulesBlockFactory
          title="SG To"
          popoverPosition="left"
          addpopoverPosition="top"
          type="sgSgIcmp"
          subtype="to"
          isDisabled={!centerSg}
          inTransformBlock={false}
        />
      }
    />
  )
}
