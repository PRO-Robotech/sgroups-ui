import styled from 'styled-components'
import { Layout } from 'antd'

const Container = styled(Layout.Header)`
  display: flex;
  align-items: center;
`

const Link = styled.a`
  display: contents;
  color: white;
`

const Heading = styled.h1`
  margin-left: 30px;
`

export const Styled = {
  Container,
  Link,
  Heading,
}
