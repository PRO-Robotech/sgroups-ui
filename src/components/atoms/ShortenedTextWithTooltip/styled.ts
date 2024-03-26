import styled from 'styled-components'

type TShortenedTextProps = {
  $maxWidth: number
}

export const ShortenedText = styled.div<TShortenedTextProps>`
  max-width: ${({ $maxWidth }) => $maxWidth}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Styled = {
  ShortenedText,
}
