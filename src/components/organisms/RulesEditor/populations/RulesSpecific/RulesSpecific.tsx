import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { TcpUdpAndIcmpSwitcher } from '../../atoms'
import { SelectCenterSg } from '../../molecules'
import { RulesBlockFactory } from '../../organisms'
import { Styled } from './styled'

type TRulesSpecificProps = {
  onSelectCenterSg: (value?: string) => void
}

export const RulesSpecific: FC<TRulesSpecificProps> = ({ onSelectCenterSg }) => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)

  return (
    <Styled.Container>
      <SelectCenterSg onSelectCenterSg={onSelectCenterSg} notInTransformBlock />
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
          />
        }
      />
    </Styled.Container>
  )
}
