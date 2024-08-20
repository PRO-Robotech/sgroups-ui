import React, { FC, useState, useEffect } from 'react'
import {
  CARDS_CONTAINER,
  CENTRAL_ID,
  CIDR_FROM_ID,
  SG_AND_SG_SG_ICMP_FROM_ID,
  SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID,
  SG_AND_SG_SG_ICMP_TO_ID,
  SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID,
  CIDR_TO_ID,
  FQDN_TO_ID,
} from '../../constants'
import { AnimatedArrow } from '../../atoms'
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
      <svg fill="none" width={dimensions.width} height={dimensions.height} className="transform-gpu">
        <AnimatedArrow type="ingress" idFirst={SG_AND_SG_SG_ICMP_FROM_ID} idSecond={CENTRAL_ID} />
        <AnimatedArrow type="ingress" idFirst={CIDR_FROM_ID} idSecond={CENTRAL_ID} />
        <AnimatedArrow type="ingress" idFirst={SG_SG_IE_AND_SG_SG_IE_ICMP_FROM_ID} idSecond={CENTRAL_ID} />
        <AnimatedArrow type="egress" curvature={-100} idFirst={CENTRAL_ID} idSecond={SG_AND_SG_SG_ICMP_TO_ID} />
        <AnimatedArrow type="egress" curvature={-100} idFirst={CENTRAL_ID} idSecond={CIDR_TO_ID} />
        <AnimatedArrow
          type="egress"
          curvature={-100}
          idFirst={CENTRAL_ID}
          idSecond={SG_SG_IE_AND_SG_SG_IE_ICMP_TO_ID}
        />
        <AnimatedArrow type="egress" curvature={-100} idFirst={CENTRAL_ID} idSecond={FQDN_TO_ID} />
      </svg>
    </Styled.Container>
  )
}
