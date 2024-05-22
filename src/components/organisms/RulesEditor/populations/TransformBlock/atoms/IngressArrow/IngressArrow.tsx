import React, { FC, useEffect, useState } from 'react'
import { TThreeDotsArrowCords } from 'localTypes/rulesArrows'
import { STROKE_COLOR, STROKE_WIDTH, ARROW_END_GAP, INGRESS_END_MARGIN } from '../../constants'

type TIngressArrowProps = {
  idFirst: string
  idSecond: string
}

export const IngressArrow: FC<TIngressArrowProps> = ({ idFirst, idSecond }) => {
  const [cords, setCords] = useState<TThreeDotsArrowCords>({
    start: { x: 0, y: 0 },
    middle: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  })

  useEffect(() => {
    const startContainer: HTMLElement | null = document.querySelector(`#${idFirst}`)
    const endContainer: HTMLElement | null = document.querySelector(`#${idSecond}`)
    if (startContainer && endContainer) {
      const start = {
        x: startContainer.offsetLeft + startContainer.clientWidth,
        y: startContainer.offsetTop + startContainer.clientHeight / 2,
      }
      const end = {
        x: endContainer.offsetLeft - ARROW_END_GAP - INGRESS_END_MARGIN,
        y: endContainer.offsetTop + endContainer.clientHeight / 2,
      }
      const middle = {
        x: (end.x - start.x) / 3 + start.x,
        y: start.y,
      }
      setCords({
        start: { ...start },
        middle: { ...middle },
        end: { ...end },
      })
    }
  }, [idFirst, idSecond])

  return (
    <>
      <line
        x1={cords.start.x}
        y1={cords.start.y}
        x2={cords.middle.x}
        y2={cords.middle.y}
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
      <line
        x1={cords.middle.x}
        y1={cords.middle.y}
        x2={cords.end.x}
        y2={cords.end.y}
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />
    </>
  )
}
