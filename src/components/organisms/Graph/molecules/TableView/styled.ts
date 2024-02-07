import styled from 'styled-components'
import { Tag } from 'antd'

const Container = styled.div`
  max-height: 520px;
  margin-top: auto;
`

const TagWithCursor = styled(Tag)`
  cursor: pointer;
`

const BigMessageContainer = styled.div`
  max-height: 50px;
  overflow-x: auto;
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const TitleIconsContainer = styled.div`
  margin-top: 13px;
  margin-left: 10px;
  font-size: 18px;
`

export const Styled = {
  Container,
  TagWithCursor,
  BigMessageContainer,
  TitleContainer,
  TitleIconsContainer,
}
