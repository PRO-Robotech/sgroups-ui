import styled from 'styled-components'
import { InfoCircleOutlined } from '@ant-design/icons'

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  display: flex;
  justify-content: center;
  flex-flow: column;
  align-items: center;
`

const Icon = styled(InfoCircleOutlined)`
  color: #00000040;
  font-size: 24px;
  margin-bottom: 4px;
`

const Text = styled.div`
  font-size: 16px;
  line-height: 24px;
  color: #00000040;
`

export const Styled = {
  Container,
  Icon,
  Text,
}
