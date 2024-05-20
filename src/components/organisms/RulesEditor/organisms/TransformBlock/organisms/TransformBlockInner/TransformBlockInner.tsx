import React, { FC, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { setRulesSgSgIeFrom, setRulesSgSgIeTo } from 'store/editor/rulesSgSgIe/rulesSgSgIe'
import { setRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpTo } from 'store/editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { setRulesSgFqdnTo } from 'store/editor/rulesSgFqdn/rulesSgFqdn'
import { setRulesSgCidrFrom, setRulesSgCidrTo } from 'store/editor/rulesSgCidr/rulesSgCidr'
import { setRulesSgCidrIcmpFrom, setRulesSgCidrIcmpTo } from 'store/editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import { Spacer } from 'components'
import {
  SelectMainSg,
  SgFqdnRules,
  GroupSgAndSgSgIcmpRules,
  GroupSgSgIeAndSgSgIeIcmpRules,
  GroupSgCidrAndSgCidrIcmpRules,
} from '../../../../molecules'
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
  onSelectMainSg: (value?: string) => void
}

export const TransformBlockInner: FC<TTransformBlockInnerProps> = ({ onSelectMainSg }) => {
  const [arrowsKey, setArrowsKey] = useState(0)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
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

  const forceArrowsUpdate = () => {
    setArrowsKey(Math.random())
  }

  return (
    <Styled.CardsContainer id={CARDS_CONTAINER}>
      <Styled.CardsCol>
        <div id={SG_AND_SG_SG_ICMP_FROM_ID}>
          <GroupSgAndSgSgIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="SG From"
            popoverPosition="left"
            rules={rulesSgSgFrom}
            setRules={setRulesSgSgFrom}
            rulesOtherside={rulesSgSgTo}
            setRulesOtherside={setRulesSgSgTo}
            rulesIcmp={rulesSgSgIcmpFrom}
            setRulesIcmp={setRulesSgSgIcmpFrom}
            rulesOthersideIcmp={rulesSgSgIcmpTo}
            setRulesOthersideIcmp={setRulesSgSgIcmpTo}
            centerSg={centerSg}
            isDisabled
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID}>
          <GroupSgSgIeAndSgSgIeIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="SG-SG-IE From"
            popoverPosition="left"
            rules={rulesSgSgIeFrom}
            setRules={setRulesSgSgIeFrom}
            rulesIcmp={rulesSgSgIeIcmpFrom}
            setRulesIcmp={setRulesSgSgIeIcmpFrom}
            defaultTraffic="Ingress"
            isDisabled={!centerSg}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={CIDR_FROM_ID}>
          <GroupSgCidrAndSgCidrIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="CIDR From"
            popoverPosition="left"
            rules={rulesSgCidrFrom}
            setRules={setRulesSgCidrFrom}
            rulesIcmp={rulesSgCidrIcmpFrom}
            setRulesIcmp={setRulesSgCidrIcmpFrom}
            defaultTraffic="Ingress"
            isDisabled={!centerSg}
          />
        </div>
      </Styled.CardsCol>
      <Styled.CardsCol>
        <Styled.CenterColWithMarginAuto id={CENTRAL_ID}>
          <SelectMainSg centerSg={centerSg} onSelectMainSg={onSelectMainSg} />
        </Styled.CenterColWithMarginAuto>
      </Styled.CardsCol>
      <Styled.CardsCol>
        <div id={SG_AND_SG_SG_ICMP_TO_ID}>
          <GroupSgAndSgSgIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="SG To"
            popoverPosition="right"
            rules={rulesSgSgTo}
            setRules={setRulesSgSgTo}
            rulesOtherside={rulesSgSgFrom}
            setRulesOtherside={setRulesSgSgFrom}
            rulesIcmp={rulesSgSgIcmpTo}
            setRulesIcmp={setRulesSgSgIcmpTo}
            rulesOthersideIcmp={rulesSgSgIcmpFrom}
            setRulesOthersideIcmp={setRulesSgSgIcmpFrom}
            centerSg={centerSg}
            isDisabled={!centerSg}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID}>
          <GroupSgSgIeAndSgSgIeIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="SG-SG-IE To"
            popoverPosition="right"
            rules={rulesSgSgIeTo}
            setRules={setRulesSgSgIeTo}
            rulesIcmp={rulesSgSgIeIcmpTo}
            setRulesIcmp={setRulesSgSgIeIcmpTo}
            defaultTraffic="Egress"
            isDisabled={!centerSg}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={CIDR_TO_ID}>
          <GroupSgCidrAndSgCidrIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="CIDR To"
            popoverPosition="right"
            rules={rulesSgCidrTo}
            setRules={setRulesSgCidrTo}
            rulesIcmp={rulesSgCidrIcmpTo}
            setRulesIcmp={setRulesSgCidrIcmpTo}
            defaultTraffic="Egress"
            isDisabled={!centerSg}
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={FQDN_TO_ID}>
          <SgFqdnRules
            forceArrowsUpdate={forceArrowsUpdate}
            title="FQDN To"
            popoverPosition="right"
            rules={rulesSgFqdnTo}
            setRules={setRulesSgFqdnTo}
            isDisabled={!centerSg}
          />
        </div>
      </Styled.CardsCol>
      <Arrows key={arrowsKey} />
    </Styled.CardsContainer>
  )
}
