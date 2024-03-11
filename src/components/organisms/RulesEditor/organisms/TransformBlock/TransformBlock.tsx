import React, { FC, Dispatch, SetStateAction, useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Spacer } from 'components'
import { TFormSgRule, TFormFqdnRule, TFormCidrSgRule, TFormSgSgIcmpRule, TFormSgSgIeRule } from 'localTypes/rules'
import { SGRules, FQDNRules, SelectMainSG, CidrSGRules, SgSgIcmpRules, SgSgIeRules } from '../../molecules'
import { Arrows } from './molecules'
import {
  CARDS_CONTAINER,
  SG_FROM_ID,
  SG_SG_ICMP_FROM_ID,
  CIDR_FROM_ID,
  SG_SG_IE_FROM_ID,
  CENTRAL_ID,
  SG_TO_ID,
  SG_SG_ICMP_TO_ID,
  CIDR_TO_ID,
  SG_SG_IE_TO_ID,
  FQDN_TO_ID,
} from './constants'
import { Styled } from './styled'

type TTransformBlockProps = {
  sgNames: string[]
  rulesSgFrom: TFormSgRule[]
  setRulesSgFrom: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesSgTo: TFormSgRule[]
  setRulesSgTo: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesFqdnTo: TFormFqdnRule[]
  setRulesFqdnTo: Dispatch<SetStateAction<TFormFqdnRule[]>>
  rulesCidrSgFrom: TFormCidrSgRule[]
  setRulesCidrSgFrom: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesCidrSgTo: TFormCidrSgRule[]
  setRulesCidrSgTo: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[]
  setRulesSgSgIcmpFrom: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[]
  setRulesSgSgIcmpTo: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesSgSgIeFrom: TFormSgSgIeRule[]
  setRulesSgSgIeFrom: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  rulesSgSgIeTo: TFormSgSgIeRule[]
  setRulesSgSgIeTo: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  setCenterSg: Dispatch<SetStateAction<string | undefined>>
  centerSg?: string
}

export const TransformBlock: FC<TTransformBlockProps> = ({
  sgNames,
  setCenterSg,
  rulesSgFrom,
  setRulesSgFrom,
  rulesSgTo,
  setRulesSgTo,
  rulesFqdnTo,
  setRulesFqdnTo,
  rulesCidrSgFrom,
  setRulesCidrSgFrom,
  rulesCidrSgTo,
  setRulesCidrSgTo,
  rulesSgSgIcmpFrom,
  setRulesSgSgIcmpFrom,
  rulesSgSgIcmpTo,
  setRulesSgSgIcmpTo,
  rulesSgSgIeFrom,
  setRulesSgSgIeFrom,
  rulesSgSgIeTo,
  setRulesSgSgIeTo,
  centerSg,
}) => {
  const [arrowsKey, setArrowsKey] = useState(0)

  useEffect(() => {
    setArrowsKey(Math.random())
  }, [
    rulesSgFrom.length,
    rulesSgTo.length,
    rulesFqdnTo.length,
    rulesCidrSgFrom.length,
    rulesCidrSgTo.length,
    rulesSgSgIeFrom.length,
    rulesSgSgIeTo.length,
  ])

  return (
    <TransformWrapper
      minScale={0.05}
      initialScale={0.5}
      doubleClick={{ disabled: true }}
      alignmentAnimation={{ disabled: true }}
      centerOnInit
      wheel={{ excluded: ['no-scroll'] }}
    >
      <TransformComponent wrapperStyle={{ width: '100%', height: '100vh' }}>
        <Styled.CardsContainer id={CARDS_CONTAINER}>
          <Styled.CardsCol>
            <div id={SG_FROM_ID}>
              <SGRules
                sgNames={sgNames}
                title={`SG From - ${centerSg || ''}`}
                popoverPosition="left"
                rules={rulesSgFrom}
                setRules={setRulesSgFrom}
                rulesOtherside={rulesSgTo}
                setRulesOtherside={setRulesSgTo}
                centerSg={centerSg}
                isDisabled
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={SG_SG_ICMP_FROM_ID}>
              <SgSgIcmpRules
                sgNames={sgNames}
                title={`SG ICMP From - ${centerSg || ''}`}
                popoverPosition="left"
                rules={rulesSgSgIcmpFrom}
                setRules={setRulesSgSgIcmpFrom}
                rulesOtherside={rulesSgSgIcmpTo}
                setRulesOtherside={setRulesSgSgIcmpTo}
                centerSg={centerSg}
                isDisabled
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={CIDR_FROM_ID}>
              <CidrSGRules
                title={`CIDR From - ${centerSg || ''}`}
                popoverPosition="left"
                rules={rulesCidrSgFrom}
                setRules={setRulesCidrSgFrom}
                defaultTraffic="Ingress"
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={SG_SG_IE_FROM_ID}>
              <SgSgIeRules
                sgNames={sgNames}
                title={`SG-SG-IE From - ${centerSg || ''}`}
                popoverPosition="left"
                rules={rulesSgSgIeFrom}
                setRules={setRulesSgSgIeFrom}
                defaultTraffic="Ingress"
                isDisabled={!centerSg}
              />
            </div>
          </Styled.CardsCol>
          <Styled.CardsCol>
            <Styled.CenterColWithMarginAuto id={CENTRAL_ID}>
              <SelectMainSG sgNames={sgNames} centerSg={centerSg} onSelectMainSg={setCenterSg} />
            </Styled.CenterColWithMarginAuto>
          </Styled.CardsCol>
          <Styled.CardsCol>
            <div id={SG_TO_ID}>
              <SGRules
                sgNames={sgNames}
                title={`${centerSg || ''} - SG To`}
                popoverPosition="right"
                rules={rulesSgTo}
                setRules={setRulesSgTo}
                rulesOtherside={rulesSgFrom}
                setRulesOtherside={setRulesSgFrom}
                centerSg={centerSg}
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={SG_SG_ICMP_TO_ID}>
              <SgSgIcmpRules
                sgNames={sgNames}
                title={`${centerSg || ''} - SG ICMP To`}
                popoverPosition="right"
                rules={rulesSgSgIcmpTo}
                setRules={setRulesSgSgIcmpTo}
                rulesOtherside={rulesSgSgIcmpFrom}
                setRulesOtherside={setRulesSgSgIcmpFrom}
                centerSg={centerSg}
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={CIDR_TO_ID}>
              <CidrSGRules
                title={`${centerSg || ''} - CIDR To`}
                popoverPosition="right"
                rules={rulesCidrSgTo}
                setRules={setRulesCidrSgTo}
                defaultTraffic="Egress"
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={SG_SG_IE_TO_ID}>
              <SgSgIeRules
                sgNames={sgNames}
                title={`${centerSg || ''} - CIDR To`}
                popoverPosition="right"
                rules={rulesSgSgIeTo}
                setRules={setRulesSgSgIeTo}
                defaultTraffic="Egress"
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={FQDN_TO_ID}>
              <FQDNRules
                title={`${centerSg || ''} - FQDN To`}
                popoverPosition="right"
                rules={rulesFqdnTo}
                setRules={setRulesFqdnTo}
                isDisabled={!centerSg}
              />
            </div>
          </Styled.CardsCol>
          <Arrows key={arrowsKey} />
        </Styled.CardsContainer>
      </TransformComponent>
    </TransformWrapper>
  )
}
