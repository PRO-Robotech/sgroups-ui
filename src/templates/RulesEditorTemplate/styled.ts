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
  width: 170px;
  height: 100vh;
  background: #001529;
`

export const Styled = {
  HeaderContainer,
  SidebarContainer,
}
