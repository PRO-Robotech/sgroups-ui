import styled from 'styled-components'

type TDefaultColorProviderProps = {
  $color: string
}

export const DefaultColorProvider = styled.div<TDefaultColorProviderProps>`
  color: ${({ $color }) => $color};

  td {
    color: ${({ $color }) => $color};
  }
`
