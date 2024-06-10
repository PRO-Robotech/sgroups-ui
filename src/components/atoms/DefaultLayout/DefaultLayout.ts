import styled from 'styled-components'

const Layout = styled.div`
  background: #fff;
  min-height: 100vh;
  width: 100%;
`

const LayoutWithPadding = styled(Layout)`
  padding: 0 24px 24px;
`

const ContentContainer = styled.div`
  min-height: 280px;
  margin: 0;
  padding: 24px;
`

export const DefaultLayout = {
  Layout,
  LayoutWithPadding,
  ContentContainer,
}
