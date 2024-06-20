import styled from 'styled-components'

const Layout = styled.div`
  background: #fff;
  min-height: 100vh;
  width: 100%;
`

const ContentContainer = styled.div`
  min-height: 280px;
  margin: 0;
  max-width: calc(100vw - 240px) !important;
`

export const DefaultLayout = {
  Layout,
  ContentContainer,
}
