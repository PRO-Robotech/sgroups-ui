import React, { FC, useState, useEffect } from 'react'
import {
  CARDS_CONTAINER,
  CENTRAL_ID,
  CIDR_FROM_ID,
  SG_AND_SG_SG_ICMP_FROM_ID,
  CIDR_TO_ID,
  FQDN_TO_ID,
  SG_AND_SG_SG_ICMP_TO_ID,
  SG_SG_IE_FROM_ID,
  SG_SG_IE_TO_ID,
  STROKE_COLOR,
} from '../../constants'
import { IngressArrow, EgressArrow, IngressEndLine, EgressStartLine } from '../../atoms'
import { Styled } from './styled'

export const Arrows: FC = () => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const cardsContainer: HTMLElement | null = document.querySelector(`#${CARDS_CONTAINER}`)
    if (cardsContainer) {
      setDimensions({
        width: cardsContainer.clientWidth,
        height: cardsContainer.clientHeight,
      })
    }
  }, [])

  return (
    <Styled.Container>
      <svg width={dimensions.width} height={dimensions.height}>
        <defs>
          <marker
            id="triangle"
            viewBox="0 0 10 10"
            refX="1"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={STROKE_COLOR} />
          </marker>
        </defs>
        <IngressArrow idFirst={SG_AND_SG_SG_ICMP_FROM_ID} idSecond={CENTRAL_ID} />
        <IngressArrow idFirst={CIDR_FROM_ID} idSecond={CENTRAL_ID} />
        <IngressArrow idFirst={SG_SG_IE_FROM_ID} idSecond={CENTRAL_ID} />
        <IngressEndLine id={CENTRAL_ID} />
        <EgressStartLine id={CENTRAL_ID} />
        <EgressArrow idFirst={CENTRAL_ID} idSecond={SG_AND_SG_SG_ICMP_TO_ID} />
        <EgressArrow idFirst={CENTRAL_ID} idSecond={CIDR_TO_ID} />
        <EgressArrow idFirst={CENTRAL_ID} idSecond={SG_SG_IE_TO_ID} />
        <EgressArrow idFirst={CENTRAL_ID} idSecond={FQDN_TO_ID} />
      </svg>
    </Styled.Container>
  )
}
