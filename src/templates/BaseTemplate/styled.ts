import styled from 'styled-components'
import { PositionSticky } from 'components'

const Container = styled.div`
  min-height: 100vh;
`

const PositionStickyWithNoUserSelect = styled(PositionSticky)`
  user-select: none;
`

export const Styled = {
  Container,
  PositionStickyWithNoUserSelect,
}
