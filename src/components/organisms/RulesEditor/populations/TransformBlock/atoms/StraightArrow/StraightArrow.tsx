import React, { FC, useEffect, useState } from 'react'
import { TStraightArrowCords } from 'localTypes/rulesArrows'
import { STROKE_COLOR, STROKE_WIDTH, ARROW_END_GAP, INGRESS_END_MARGIN } from '../../constants'

type TStraightArrowProps = {
  idFirst: string
  idSecond: string
}

export const StraightArrow: FC<TStraightArrowProps> = ({ idFirst, idSecond }) => {
  const [cords, setCords] = useState<TStraightArrowCords>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })

  useEffect(() => {
    const startContainer: HTMLElement | null = document.querySelector(`#${idFirst}`)
    const endContainer: HTMLElement | null = document.querySelector(`#${idSecond}`)
    if (startContainer && endContainer) {
      setCords({
        start: {
          x: startContainer.offsetLeft + startContainer.clientWidth,
          y: startContainer.offsetTop + startContainer.clientHeight / 2,
        },
        end: {
          x: endContainer.offsetLeft - ARROW_END_GAP - INGRESS_END_MARGIN,
          y: endContainer.offsetTop + endContainer.clientHeight / 2,
        },
      })
    }
  }, [idFirst, idSecond])

  return (
    <line
      x1={cords.start.x}
      y1={cords.start.y}
      x2={cords.end.x}
      y2={cords.end.y}
      stroke={STROKE_COLOR}
      strokeWidth={STROKE_WIDTH}
    />
  )
}
