import React, { FC, useEffect, useState } from 'react'
import { TThreeDotsArrowCords } from 'localTypes/rulesArrows'
import { STROKE_COLOR, STROKE_WIDTH, ARROW_END_GAP, EGRESS_START_MARGIN } from '../../constants'

type TEgressArrowProps = {
  idFirst: string
  idSecond: string
}

export const EgressArrow: FC<TEgressArrowProps> = ({ idFirst, idSecond }) => {
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
        x: startContainer.offsetLeft + startContainer.clientWidth + EGRESS_START_MARGIN,
        y: startContainer.offsetTop + startContainer.clientHeight / 2,
      }
      const end = {
        x: endContainer.offsetLeft - ARROW_END_GAP,
        y: endContainer.offsetTop + endContainer.clientHeight / 2,
      }
      const middle = {
        x: (end.x - start.x) / 1.5 + start.x,
        y: end.y,
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
        markerEnd="url(#triangle)"
      />
    </>
  )
}
