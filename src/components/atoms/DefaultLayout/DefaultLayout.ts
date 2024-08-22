import styled from 'styled-components'

type TLayoutProps = {
  $bgColor: string
}

const Layout = styled.div<TLayoutProps>`
  background: ${({ $bgColor }) => $bgColor};
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
