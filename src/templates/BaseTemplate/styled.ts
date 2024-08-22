import styled from 'styled-components'
import { PositionSticky } from 'components'

type TContainerProps = {
  $isDark: boolean
}

const Container = styled.div<TContainerProps>`
  min-height: 100vh;

  && aside {
    border-right: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#ededed')};
  }
`

const PositionStickyWithNoUserSelect = styled(PositionSticky)`
  user-select: none;
`

export const Styled = {
  Container,
  PositionStickyWithNoUserSelect,
}
