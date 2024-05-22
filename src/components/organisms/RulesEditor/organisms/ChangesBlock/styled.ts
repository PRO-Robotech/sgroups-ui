import styled from 'styled-components'

const ScrollContainer = styled.div`
  max-height: 80%;
  overflow-x: auto;
`

const ButtonsContainer = styled.div`
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(2, 75px);
`

export const Styled = {
  ScrollContainer,
  ButtonsContainer,
}
