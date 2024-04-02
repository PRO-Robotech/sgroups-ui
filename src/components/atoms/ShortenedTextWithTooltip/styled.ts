import styled from 'styled-components'

type TShortenedTextProps = {
  $maxWidth: number
}

export const ShortenedText = styled.div<TShortenedTextProps>`
  max-width: ${({ $maxWidth }) => $maxWidth}px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const Styled = {
  ShortenedText,
}
