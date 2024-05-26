import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgCidrFrom, setRulesSgCidrTo } from 'store/editor/rulesSgCidr/rulesSgCidr'
import { setRulesSgCidrIcmpFrom, setRulesSgCidrIcmpTo } from 'store/editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgCidr: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgCidrFrom = useSelector((state: RootState) => state.rulesSgCidr.rulesFrom)
  const rulesSgCidrTo = useSelector((state: RootState) => state.rulesSgCidr.rulesTo)
  const rulesSgCidrIcmpFrom = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesFrom)
  const rulesSgCidrIcmpTo = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesTo)

  return (
    <>
      <TcpUdpAndIcmpSwitcher
        notInTransformBlock
        tcpUdpComponent={
          <RulesBlockFactory
            title="CIDR From"
            popoverPosition="left"
            type="sgCidr"
            data={{
              rules: rulesSgCidrFrom,
              setRules: setRulesSgCidrFrom,
              defaultTraffic: 'Ingress',
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
        icmpComponent={
          <RulesBlockFactory
            title="CIDR From"
            popoverPosition="left"
            type="sgCidrIcmp"
            data={{
              rules: rulesSgCidrIcmpFrom,
              setRules: setRulesSgCidrIcmpFrom,
              defaultTraffic: 'Ingress',
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
      />

      <TcpUdpAndIcmpSwitcher
        notInTransformBlock
        tcpUdpComponent={
          <RulesBlockFactory
            title="CIDR To"
            popoverPosition="right"
            type="sgCidr"
            data={{
              rules: rulesSgCidrTo,
              setRules: setRulesSgCidrTo,
              defaultTraffic: 'Egress',
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
        icmpComponent={
          <RulesBlockFactory
            title="CIDR To"
            popoverPosition="right"
            type="sgCidrIcmp"
            data={{
              rules: rulesSgCidrIcmpTo,
              setRules: setRulesSgCidrIcmpTo,
              defaultTraffic: 'Egress',
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
      />
    </>
  )
}
