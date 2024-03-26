import React, { FC } from 'react'
import { Tooltip } from 'antd'
import { Styled } from './styled'

type TShortenedTextWithTooltip = {
  text: string
  maxWidth?: number
}

export const ShortenedTextWithTooltip: FC<TShortenedTextWithTooltip> = ({ text, maxWidth = 200 }) => {
  return (
    <Tooltip title={text}>
      <Styled.ShortenedText $maxWidth={maxWidth}>{text}</Styled.ShortenedText>
    </Tooltip>
  )
}
