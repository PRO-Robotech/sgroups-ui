import React, { FC, useEffect, useState } from 'react'
import { TStraightArrowCords } from 'localTypes/rulesArrows'
import { STROKE_COLOR, STROKE_WIDTH, ARROW_END_GAP, INGRESS_END_MARGIN } from '../../constants'

type TIngressEndLineProps = {
  id: string
}

export const IngressEndLine: FC<TIngressEndLineProps> = ({ id }) => {
  const [cords, setCords] = useState<TStraightArrowCords>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })

  useEffect(() => {
    const endContainer: HTMLElement | null = document.querySelector(`#${id}`)
    if (endContainer) {
      setCords({
        start: {
          x: endContainer.offsetLeft - ARROW_END_GAP - INGRESS_END_MARGIN,
          y: endContainer.offsetTop + endContainer.clientHeight / 2,
        },
        end: {
          x: endContainer.offsetLeft - ARROW_END_GAP,
          y: endContainer.offsetTop + endContainer.clientHeight / 2,
        },
      })
    }
  }, [id])

  return (
    <line
      x1={cords.start.x}
      y1={cords.start.y}
      x2={cords.end.x}
      y2={cords.end.y}
      stroke={STROKE_COLOR}
      strokeWidth={STROKE_WIDTH}
      markerEnd="url(#triangle)"
    />
  )
}
