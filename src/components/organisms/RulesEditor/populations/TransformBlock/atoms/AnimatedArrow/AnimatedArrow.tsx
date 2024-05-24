// https://magicui.design/docs/components/animated-beam

import React, { FC, useEffect, useState, useId } from 'react'
import { motion } from 'framer-motion'
import { STROKE_COLOR, STROKE_WIDTH, STROKE_OPACITY } from '../../constants'

type TAnimatedArrowProps = {
  idFirst: string
  idSecond: string
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  gradientStartColor?: string
  gradientStopColor?: string
}

export const AnimatedArrow: FC<TAnimatedArrowProps> = ({
  idFirst,
  idSecond,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  gradientStartColor = '#ffaa40',
  gradientStopColor = '#9c40ff',
}) => {
  const [pathD, setPathD] = useState('')
  const id = useId()

  // Calculate the gradient coordinates based on the reverse prop
  const gradientCoordinates = reverse
    ? {
        x1: ['90%', '-10%'],
        x2: ['100%', '0%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%'],
      }
    : {
        x1: ['10%', '110%'],
        x2: ['0%', '100%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%'],
      }

  useEffect(() => {
    const startContainer: HTMLElement | null = document.querySelector(`#${idFirst}`)
    const endContainer: HTMLElement | null = document.querySelector(`#${idSecond}`)
    if (startContainer && endContainer) {
      const start = {
        x: startContainer.offsetLeft + startContainer.clientWidth + 3,
        y: startContainer.offsetTop + startContainer.clientHeight / 2,
      }
      const end = {
        x: endContainer.offsetLeft - 3,
        y: endContainer.offsetTop + endContainer.clientHeight / 2,
      }
      const controlY = start.y - curvature
      const d = `M ${start.x},${start.y} Q ${(start.x + end.x) / 2},${controlY} ${end.x},${end.y}`
      setPathD(d)
    }
  }, [idFirst, idSecond, curvature])

  return (
    <>
      <path
        d={pathD}
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
        strokeOpacity={STROKE_OPACITY}
        strokeLinecap="round"
      />
      <path d={pathD} strokeWidth={STROKE_WIDTH} stroke={`url(#${id})`} strokeOpacity="1" strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: '0%',
            x2: '0%',
            y1: '0%',
            y2: '0%',
          }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1], // https://easings.net/#easeOutExpo
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </>
  )
}
