import styled from 'styled-components'

type TTextAlignContainerProps = {
  $align: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'justify-all' | 'match-parent'
}

export const TextAlignContainer = styled.div<TTextAlignContainerProps>`
  text-align: ${({ $align }) => $align};
`
