import styled from 'styled-components'

const CardsContainer = styled.div`
  display: grid;
  grid-column-gap: 150px;
  grid-template-columns: 1fr 700px 1fr;
`

const CardsCol = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
`

const CenterColWithMarginAuto = styled.div`
  width: 400px;
  margin: 0 auto;
`

export const Styled = {
  CardsContainer,
  CardsCol,
  CenterColWithMarginAuto,
}
