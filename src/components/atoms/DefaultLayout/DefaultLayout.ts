import { Layout } from 'antd'
import styled from 'styled-components'

const LayoutWithPadding = styled(Layout)`
  min-height: 100vh;
  padding: 0 24px 24px;
`

const ContentContainer = styled(Layout.Content)`
  min-height: 280px;
  margin: 0;
  padding: 24px;
`

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
`

export const DefaultLayout = {
  LayoutWithPadding,
  ContentContainer,
  BreadcrumbContainer,
}
