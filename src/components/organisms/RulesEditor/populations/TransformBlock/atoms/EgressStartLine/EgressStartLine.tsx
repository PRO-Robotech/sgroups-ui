import React, { FC, useEffect, useState } from 'react'
import { TStraightArrowCords } from 'localTypes/rulesArrows'
import { STROKE_COLOR, STROKE_WIDTH, EGRESS_START_MARGIN } from '../../constants'

type TEgressStartLineProps = {
  id: string
}

export const EgressStartLine: FC<TEgressStartLineProps> = ({ id }) => {
  const [cords, setCords] = useState<TStraightArrowCords>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })

  useEffect(() => {
    const startContainer: HTMLElement | null = document.querySelector(`#${id}`)
    if (startContainer) {
      setCords({
        start: {
          x: startContainer.offsetLeft + startContainer.clientWidth,
          y: startContainer.offsetTop + startContainer.clientHeight / 2,
        },
        end: {
          x: startContainer.offsetLeft + startContainer.clientWidth + EGRESS_START_MARGIN,
          y: startContainer.offsetTop + startContainer.clientHeight / 2,
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
    />
  )
}
