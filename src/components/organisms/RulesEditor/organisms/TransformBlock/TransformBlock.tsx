import React, { FC, Dispatch, SetStateAction, useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Spacer } from 'components'
import { TFormSgRule, TFormFqdnRule, TFormCidrSgRule } from 'localTypes/rules'
import { SGRules, FQDNRules, SelectMainSG, CidrSGRules } from '../../molecules'
import { Arrows } from './molecules'
import { CARDS_CONTAINER, SG_FROM_ID, CIDR_FROM_ID, CENTRAL_ID, SG_TO_ID, CIDR_TO_ID, FQDN_TO_ID } from './constants'
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
  centerSg,
}) => {
  const [arrowsKey, setArrowsKey] = useState(0)

  useEffect(() => {
    setArrowsKey(Math.random())
  }, [rulesSgFrom.length, rulesSgTo.length, rulesFqdnTo.length, rulesCidrSgFrom.length, rulesCidrSgTo.length])

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
                title="SG From"
                popoverPosition="left"
                rules={rulesSgFrom}
                setRules={setRulesSgFrom}
                isDisabled
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={CIDR_FROM_ID}>
              <CidrSGRules
                title="CIDR From"
                popoverPosition="left"
                rules={rulesCidrSgFrom}
                setRules={setRulesCidrSgFrom}
                defaultTraffic="Egress"
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
                title="SG To"
                popoverPosition="right"
                rules={rulesSgTo}
                setRules={setRulesSgTo}
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={CIDR_TO_ID}>
              <CidrSGRules
                title="CIDR To"
                popoverPosition="right"
                rules={rulesCidrSgTo}
                setRules={setRulesCidrSgTo}
                defaultTraffic="Ingress"
                isDisabled={!centerSg}
              />
            </div>
            <Spacer $space={100} $samespace />
            <div id={FQDN_TO_ID}>
              <FQDNRules
                title="FQDN To"
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
