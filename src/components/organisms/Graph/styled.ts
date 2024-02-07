import styled from 'styled-components'
import { Card } from 'antd'

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: calc(100vh - 120px);
`

const GraphAndFilters = styled.div`
  display: grid;
  grid-template-columns: 100%;
  height: 100%;

  @media (min-width: 1024px) {
    grid-gap: 50px;
    grid-template-columns: 1fr 300px;
  }
`

const FullHeightCard = styled(Card)`
  height: 100%;
`

export const Styled = {
  Container,
  GraphAndFilters,
  FullHeightCard,
}
