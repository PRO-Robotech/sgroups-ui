import styled from 'styled-components'
import { Button } from 'antd'

const NetworksContainer = styled.div`
  max-height: 75px;
  overflow-y: auto;
`

const ButtonWithMarginLeft = styled(Button)`
  margin-left: 10px;
`

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 50px;
`

export const Styled = {
  NetworksContainer,
  ButtonWithMarginLeft,
  FiltersContainer,
}
