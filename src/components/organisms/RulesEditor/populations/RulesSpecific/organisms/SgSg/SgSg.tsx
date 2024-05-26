import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { TcpUdpAndIcmpSwitcher } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgSg: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)

  return (
    <>
      <TcpUdpAndIcmpSwitcher
        notInTransformBlock
        tcpUdpComponent={
          <RulesBlockFactory
            title="SG From"
            popoverPosition="left"
            addpopoverPosition="top"
            type="sgSg"
            data={{
              rules: rulesSgSgFrom,
              setRules: setRulesSgSgFrom,
              rulesOtherside: rulesSgSgTo,
              setRulesOtherside: setRulesSgSgTo,
              centerSg,
            }}
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
            data={{
              rules: rulesSgSgIcmpFrom,
              setRules: setRulesSgSgIcmpFrom,
              rulesOtherside: rulesSgSgIcmpTo,
              setRulesOtherside: setRulesSgSgIcmpTo,
              centerSg,
            }}
            inTransformBlock={false}
          />
        }
      />

      <TcpUdpAndIcmpSwitcher
        notInTransformBlock
        tcpUdpComponent={
          <RulesBlockFactory
            title="SG To"
            popoverPosition="right"
            type="sgSg"
            data={{
              rules: rulesSgSgTo,
              setRules: setRulesSgSgTo,
              rulesOtherside: rulesSgSgFrom,
              setRulesOtherside: setRulesSgSgFrom,
              centerSg,
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
        icmpComponent={
          <RulesBlockFactory
            title="SG To"
            popoverPosition="right"
            type="sgSgIcmp"
            data={{
              rules: rulesSgSgIcmpTo,
              setRules: setRulesSgSgIcmpTo,
              rulesOtherside: rulesSgSgIcmpFrom,
              setRulesOtherside: setRulesSgSgIcmpFrom,
              centerSg,
            }}
            isDisabled={!centerSg}
            inTransformBlock={false}
          />
        }
      />
    </>
  )
}
