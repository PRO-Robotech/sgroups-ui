import styled from 'styled-components'

const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
`

const SidebarContainer = styled.div`
  position: fixed;
  top: 64px;
  left: 0;
  z-index: 999;
  width: 200px;
  height: 100vh;
  background: #001529;
  user-select: none;
`

export const Styled = {
  HeaderContainer,
  SidebarContainer,
}
