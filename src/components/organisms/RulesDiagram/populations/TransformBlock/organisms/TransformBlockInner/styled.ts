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

const CardsTitle = styled.div`
  margin: 0;
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
`

type TCenterUnchosenProps = {
  $color: string
}

const CenterUnchosen = styled.div<TCenterUnchosenProps>`
  margin: 0;
  color: #00000040;
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: ${({ $color }) => $color};
`

export const Styled = {
  CardsContainer,
  CardsCol,
  CenterColWithMarginAuto,
  CardsTitle,
  CenterUnchosen,
}
