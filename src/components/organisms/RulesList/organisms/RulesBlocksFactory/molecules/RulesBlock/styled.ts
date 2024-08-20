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
  justify-content: space-between;
  width: 100%;
`

type TLeftPartProps = {
  $isCursorPointer?: boolean
}

const LeftPart = styled.div<TLeftPartProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $isCursorPointer }) => ($isCursorPointer ? 'pointer' : 'default')};
  user-select: none;
`

const Carets = styled.div`
  margin-left: 8px;
`

export const Styled = {
  CustomCard,
  HeaderAndControls,
  LeftPart,
  Carets,
}
