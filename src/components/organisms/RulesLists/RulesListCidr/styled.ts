import styled from 'styled-components'
import { Button } from 'antd'

const PortsContainer = styled.div`
  max-height: 75px;
  overflow-y: auto;
`

const ButtonWithMarginLeft = styled(Button)`
  margin-left: 10px;
`

export const Styled = {
  PortsContainer,
  ButtonWithMarginLeft,
}
