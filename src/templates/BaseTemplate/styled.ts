import styled from 'styled-components'
import { PositionSticky } from 'components'

const Container = styled.div`
  min-height: 100vh;

  && aside {
    border-right: 1px solid #ededed;
  }
`

const PositionStickyWithNoUserSelect = styled(PositionSticky)`
  user-select: none;
`

export const Styled = {
  Container,
  PositionStickyWithNoUserSelect,
}
