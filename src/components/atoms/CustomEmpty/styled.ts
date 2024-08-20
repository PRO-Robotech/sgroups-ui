import styled from 'styled-components'
import { InfoCircleOutlined } from '@ant-design/icons'

const Container = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: calc((100vh - 65px - 57px) / 2 - 26px);
`

const Icon = styled(InfoCircleOutlined)`
  margin-bottom: 4px;
  color: #00000040;
  font-size: 24px;
`

const Text = styled.div`
  color: #00000040;
  font-size: 16px;
  line-height: 24px;
`

export const Styled = {
  Container,
  Icon,
  Text,
}
