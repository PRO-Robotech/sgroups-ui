import styled from 'styled-components'
import { Card } from 'antd'

const CustomCard = styled(Card)`
  margin-bottom: 16px;

  && .ant-card-body {
    padding: 20px 16px;
  }
`

const HeaderAndControls = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`

const BlueText = styled.span`
  margin-left: 6px;
  color: #1677ff;
`

const Carets = styled.div`
  margin-left: 8px;
`

const Header = styled.div`
  display: flex;
  width: 100%;
`

const LeftPart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Styled = {
  CustomCard,
  HeaderAndControls,
  BlueText,
  Carets,
  Header,
  LeftPart,
}
