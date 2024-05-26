import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgIeFrom, setRulesSgSgIeTo } from 'store/editor/rulesSgSgIe/rulesSgSgIe'
import { setRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpTo } from 'store/editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgSgIe: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgIeFrom = useSelector((state: RootState) => state.rulesSgSgIe.rulesFrom)
  const rulesSgSgIeTo = useSelector((state: RootState) => state.rulesSgSgIe.rulesTo)
  const rulesSgSgIeIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesFrom)
  const rulesSgSgIeIcmpTo = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesTo)

  return (
    <>
      <TcpUdpAndIcmpSwitcher
        notInTransformBlock
        tcpUdpComponent={
          <RulesBlockFactory
            title="SG-SG-IE From"
            popoverPosition="left"
            type="sgSgIe"
            data={{
              rules: rulesSgSgIeFrom,
              setRules: setRulesSgSgIeFrom,
              defaultTraffic: 'Ingress',
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
        icmpComponent={
          <RulesBlockFactory
            title="SG-SG-IE From"
            popoverPosition="left"
            type="sgSgIeIcmp"
            data={{
              rules: rulesSgSgIeIcmpFrom,
              setRules: setRulesSgSgIeIcmpFrom,
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
            title="SG-SG-IE To"
            popoverPosition="right"
            type="sgSgIe"
            data={{
              rules: rulesSgSgIeTo,
              setRules: setRulesSgSgIeTo,
              defaultTraffic: 'Egress',
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
        icmpComponent={
          <RulesBlockFactory
            title="SG-SG-IE To"
            popoverPosition="right"
            type="sgSgIeIcmp"
            data={{
              rules: rulesSgSgIeIcmpTo,
              setRules: setRulesSgSgIeIcmpTo,
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
