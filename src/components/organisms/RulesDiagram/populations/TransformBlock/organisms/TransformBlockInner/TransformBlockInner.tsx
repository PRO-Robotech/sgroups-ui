import React, { FC, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Spacer } from 'components'
import { RULES_CONFIGS_FOR_FACTORY } from '../../../../constants'
import { TcpUdpAndIcmpSwitcher, GroupRulesNodeWrapper } from '../../../../atoms'
import { SelectCenterSg } from '../../../../molecules'
import { RulesBlockFactory } from '../../../../organisms'
import { Arrows } from '../../molecules'
import {
  CARDS_CONTAINER,
  SG_AND_SG_SG_ICMP_FROM_ID,
  CIDR_FROM_ID,
  SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID,
  CENTRAL_ID,
  SG_AND_SG_SG_ICMP_TO_ID,
  CIDR_TO_ID,
  SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID,
  FQDN_TO_ID,
} from '../../constants'
import { Styled } from './styled'

type TTransformBlockInnerProps = {
  onSelectCenterSg: (value?: string) => void
}

export const TransformBlockInner: FC<TTransformBlockInnerProps> = ({ onSelectCenterSg }) => {
  const [arrowsKey, setArrowsKey] = useState(0)

  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)
  const rulesSgSgIeFrom = useSelector((state: RootState) => state.rulesSgSgIe.rulesFrom)
  const rulesSgSgIeTo = useSelector((state: RootState) => state.rulesSgSgIe.rulesTo)
  const rulesSgSgIeIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesFrom)
  const rulesSgSgIeIcmpTo = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesTo)
  const rulesSgFqdnTo = useSelector((state: RootState) => state.rulesSgFqdn.rulesTo)
  const rulesSgCidrFrom = useSelector((state: RootState) => state.rulesSgCidr.rulesFrom)
  const rulesSgCidrTo = useSelector((state: RootState) => state.rulesSgCidr.rulesTo)
  const rulesSgCidrIcmpFrom = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesFrom)
  const rulesSgCidrIcmpTo = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesTo)

  useEffect(() => {
    setArrowsKey(Math.random())
  }, [
    rulesSgSgFrom.length,
    rulesSgSgTo.length,
    rulesSgSgIcmpFrom.length,
    rulesSgSgIcmpTo.length,
    rulesSgSgIeFrom.length,
    rulesSgSgIeTo.length,
    rulesSgSgIeIcmpFrom.length,
    rulesSgSgIeIcmpTo.length,
    rulesSgFqdnTo.length,
    rulesSgCidrFrom.length,
    rulesSgCidrTo.length,
    rulesSgCidrIcmpFrom.length,
    rulesSgCidrIcmpTo.length,
  ])

  return (
    <Styled.CardsContainer id={CARDS_CONTAINER}>
      <Styled.CardsCol>
        <div id={SG_AND_SG_SG_ICMP_FROM_ID}>
          <TcpUdpAndIcmpSwitcher
            tcpUdpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSg.from} isDisabledDefault />}
            icmpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIcmp.from} />}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID}>
          <TcpUdpAndIcmpSwitcher
            tcpUdpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIe.from} />}
            icmpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIeIcmp.from} />}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={CIDR_FROM_ID}>
          <TcpUdpAndIcmpSwitcher
            tcpUdpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidr.from} />}
            icmpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidrIcmp.from} />}
          />
        </div>
      </Styled.CardsCol>
      <Styled.CardsCol>
        <Styled.CenterColWithMarginAuto id={CENTRAL_ID}>
          <SelectCenterSg onSelectCenterSg={onSelectCenterSg} />
        </Styled.CenterColWithMarginAuto>
      </Styled.CardsCol>
      <Styled.CardsCol>
        <div id={SG_AND_SG_SG_ICMP_TO_ID}>
          <TcpUdpAndIcmpSwitcher
            tcpUdpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSg.to} />}
            icmpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIcmp.to} />}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID}>
          <TcpUdpAndIcmpSwitcher
            tcpUdpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIe.to} />}
            icmpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIeIcmp.to} />}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={CIDR_TO_ID}>
          <TcpUdpAndIcmpSwitcher
            tcpUdpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidr.to} />}
            icmpComponent={<RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidrIcmp.to} />}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={FQDN_TO_ID}>
          <GroupRulesNodeWrapper>
            <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgFqdn.to} />
          </GroupRulesNodeWrapper>
        </div>
      </Styled.CardsCol>
      <Arrows key={arrowsKey} />
    </Styled.CardsContainer>
  )
}
