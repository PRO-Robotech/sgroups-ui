import React, { FC, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Spacer } from 'components'
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

  const forceArrowsUpdate = () => {
    setArrowsKey(Math.random())
  }

  return (
    <Styled.CardsContainer id={CARDS_CONTAINER}>
      <Styled.CardsCol>
        <div id={SG_AND_SG_SG_ICMP_FROM_ID}>
          <TcpUdpAndIcmpSwitcher
            forceArrowsUpdate={forceArrowsUpdate}
            tcpUdpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG From"
                popoverPosition="left"
                type="sgSg"
                subtype="from"
                isDisabled
              />
            }
            icmpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG From"
                popoverPosition="left"
                type="sgSgIcmp"
                subtype="from"
              />
            }
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID}>
          <TcpUdpAndIcmpSwitcher
            forceArrowsUpdate={forceArrowsUpdate}
            tcpUdpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG-SG-IE From"
                popoverPosition="left"
                type="sgSgIe"
                subtype="from"
                isDisabled={!centerSg}
              />
            }
            icmpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG-SG-IE From"
                popoverPosition="left"
                type="sgSgIeIcmp"
                subtype="from"
                isDisabled={!centerSg}
              />
            }
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={CIDR_FROM_ID}>
          <TcpUdpAndIcmpSwitcher
            forceArrowsUpdate={forceArrowsUpdate}
            tcpUdpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="CIDR From"
                popoverPosition="left"
                type="sgCidr"
                subtype="from"
                isDisabled={!centerSg}
              />
            }
            icmpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="CIDR From"
                popoverPosition="left"
                type="sgCidrIcmp"
                subtype="from"
                isDisabled={!centerSg}
              />
            }
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
            forceArrowsUpdate={forceArrowsUpdate}
            tcpUdpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG To"
                popoverPosition="right"
                type="sgSg"
                subtype="to"
                isDisabled={!centerSg}
              />
            }
            icmpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG To"
                popoverPosition="right"
                type="sgSgIcmp"
                subtype="to"
                isDisabled={!centerSg}
              />
            }
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID}>
          <TcpUdpAndIcmpSwitcher
            forceArrowsUpdate={forceArrowsUpdate}
            tcpUdpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG-SG-IE To"
                popoverPosition="right"
                type="sgSgIe"
                subtype="to"
                isDisabled={!centerSg}
              />
            }
            icmpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="SG-SG-IE To"
                popoverPosition="right"
                type="sgSgIeIcmp"
                subtype="to"
                isDisabled={!centerSg}
              />
            }
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={CIDR_TO_ID}>
          <TcpUdpAndIcmpSwitcher
            forceArrowsUpdate={forceArrowsUpdate}
            tcpUdpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="CIDR To"
                popoverPosition="right"
                type="sgCidr"
                subtype="to"
                isDisabled={!centerSg}
              />
            }
            icmpComponent={
              <RulesBlockFactory
                forceArrowsUpdate={forceArrowsUpdate}
                title="CIDR To"
                popoverPosition="right"
                type="sgCidrIcmp"
                subtype="to"
                isDisabled={!centerSg}
              />
            }
          />
        </div>
        <Spacer $space={100} $samespace />
        <div id={FQDN_TO_ID}>
          <GroupRulesNodeWrapper>
            <RulesBlockFactory
              forceArrowsUpdate={forceArrowsUpdate}
              title="FQDN To"
              type="sgFqdn"
              popoverPosition="right"
              subtype="to"
              isDisabled={!centerSg}
            />
          </GroupRulesNodeWrapper>
        </div>
      </Styled.CardsCol>
      <Arrows key={arrowsKey} />
    </Styled.CardsContainer>
  )
}
