import React, { FC, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Spacer } from 'components'
import { GroupRulesNodeWrapper } from '../../../../atoms'
import {
  SgSgTable,
  SgSgIcmpTable,
  SgSgIeTable,
  SgSgIeIcmpTable,
  SgFqdnTable,
  SgCidrTable,
  SgCidrIcmpTable,
} from '../../../../molecules/RulesTables'
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
  type: string
  subtype: string
}

export const TransformBlockInner: FC<TTransformBlockInnerProps> = ({ type, subtype }) => {
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
    type,
    subtype,
  ])

  return (
    <Styled.CardsContainer id={CARDS_CONTAINER}>
      <Styled.CardsCol>
        {(type === 'all' || type === 'sgSg') && (
          <>
            <div id={SG_AND_SG_SG_ICMP_FROM_ID}>
              <GroupRulesNodeWrapper>
                {subtype !== 'ICMP' ? (
                  <div>
                    <Styled.CardsTitle>SG</Styled.CardsTitle>
                    {rulesSgSgFrom.length > 0 && <SgSgTable rulesData={rulesSgSgFrom} />}
                  </div>
                ) : (
                  <div>
                    <Styled.CardsTitle>SG ICMP</Styled.CardsTitle>
                    {rulesSgSgIcmpFrom.length > 0 && <SgSgIcmpTable rulesData={rulesSgSgIcmpFrom} />}
                  </div>
                )}
              </GroupRulesNodeWrapper>
            </div>
            <Spacer $space={100} $samespace />
          </>
        )}
        {(type === 'all' || type === 'sgSgIe') && (
          <>
            <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID}>
              <GroupRulesNodeWrapper>
                {subtype !== 'ICMP' ? (
                  <div>
                    <Styled.CardsTitle>SG (I/E)</Styled.CardsTitle>
                    {rulesSgSgIeFrom.length > 0 && <SgSgIeTable rulesData={rulesSgSgIeFrom} />}
                  </div>
                ) : (
                  <div>
                    <Styled.CardsTitle>SG (I/E) ICMP</Styled.CardsTitle>
                    {rulesSgSgIeIcmpFrom.length > 0 && <SgSgIeIcmpTable rulesData={rulesSgSgIeIcmpFrom} />}
                  </div>
                )}
              </GroupRulesNodeWrapper>
            </div>
            <Spacer $space={100} $samespace />
          </>
        )}
        {(type === 'all' || type === 'sgCidr') && (
          <div id={CIDR_FROM_ID}>
            <GroupRulesNodeWrapper>
              {subtype !== 'ICMP' ? (
                <div>
                  <Styled.CardsTitle>CIDR</Styled.CardsTitle>
                  {rulesSgCidrFrom.length > 0 && <SgCidrTable rulesData={rulesSgCidrFrom} />}
                </div>
              ) : (
                <div>
                  <Styled.CardsTitle>CIDR ICMP</Styled.CardsTitle>
                  {rulesSgCidrIcmpFrom.length > 0 && <SgCidrIcmpTable rulesData={rulesSgCidrIcmpFrom} />}
                </div>
              )}
            </GroupRulesNodeWrapper>
          </div>
        )}
      </Styled.CardsCol>
      <Styled.CardsCol>
        <Styled.CenterColWithMarginAuto id={CENTRAL_ID}>
          <GroupRulesNodeWrapper $isCenterSg>
            {centerSg ? (
              <Styled.CardsTitle>{centerSg}</Styled.CardsTitle>
            ) : (
              <Styled.CenterUnchosen>Main Secuity Group</Styled.CenterUnchosen>
            )}
          </GroupRulesNodeWrapper>
        </Styled.CenterColWithMarginAuto>
      </Styled.CardsCol>
      <Styled.CardsCol>
        {(type === 'all' || type === 'sgSg') && (
          <>
            <div id={SG_AND_SG_SG_ICMP_TO_ID}>
              <GroupRulesNodeWrapper>
                {subtype !== 'ICMP' ? (
                  <div>
                    <Styled.CardsTitle>SG</Styled.CardsTitle>
                    {rulesSgSgTo.length > 0 && <SgSgTable rulesData={rulesSgSgTo} />}
                  </div>
                ) : (
                  <div>
                    <Styled.CardsTitle>SG ICMP</Styled.CardsTitle>
                    {rulesSgSgIcmpTo.length > 0 && <SgSgIcmpTable rulesData={rulesSgSgIcmpTo} />}
                  </div>
                )}
              </GroupRulesNodeWrapper>
            </div>
            <Spacer $space={100} $samespace />{' '}
          </>
        )}
        {(type === 'all' || type === 'sgSgIe') && (
          <>
            <div id={SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID}>
              <GroupRulesNodeWrapper>
                {subtype !== 'ICMP' ? (
                  <div>
                    <Styled.CardsTitle>SG (I/E</Styled.CardsTitle>
                    {rulesSgSgIeTo.length > 0 && <SgSgIeTable rulesData={rulesSgSgIeTo} />}
                  </div>
                ) : (
                  <div>
                    <Styled.CardsTitle>SG (I/E) ICMP</Styled.CardsTitle>
                    {rulesSgSgIeIcmpTo.length > 0 && <SgSgIeIcmpTable rulesData={rulesSgSgIeIcmpTo} />}
                  </div>
                )}
              </GroupRulesNodeWrapper>
            </div>
            <Spacer $space={100} $samespace />
          </>
        )}
        {(type === 'all' || type === 'sgCidr') && (
          <>
            <div id={CIDR_TO_ID}>
              <GroupRulesNodeWrapper>
                {subtype !== 'ICMP' ? (
                  <div>
                    <Styled.CardsTitle>CIDR</Styled.CardsTitle>
                    {rulesSgCidrTo.length > 0 && <SgCidrTable rulesData={rulesSgCidrTo} />}
                  </div>
                ) : (
                  <div>
                    <Styled.CardsTitle>CIDR ICMP</Styled.CardsTitle>
                    {rulesSgCidrIcmpTo.length > 0 && <SgCidrIcmpTable rulesData={rulesSgCidrIcmpTo} />}
                  </div>
                )}
              </GroupRulesNodeWrapper>
            </div>
            <Spacer $space={100} $samespace />
          </>
        )}
        {(type === 'all' || type === 'sgFqdn') && subtype !== 'ICMP' && (
          <div id={FQDN_TO_ID}>
            <GroupRulesNodeWrapper>
              <div>
                <Styled.CardsTitle>FQDN</Styled.CardsTitle>
                {rulesSgFqdnTo.length > 0 && <SgFqdnTable rulesData={subtype === 'from' ? [] : rulesSgFqdnTo} />}
              </div>
            </GroupRulesNodeWrapper>
          </div>
        )}
      </Styled.CardsCol>
      <Arrows key={arrowsKey} />
    </Styled.CardsContainer>
  )
}
