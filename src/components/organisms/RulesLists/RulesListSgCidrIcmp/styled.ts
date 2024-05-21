import styled from 'styled-components'
import { Button } from 'antd'

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 50px;
`

const ButtonWithMarginLeft = styled(Button)`
  margin-left: 10px;
`

export const Styled = {
  FiltersContainer,
  ButtonWithMarginLeft,
}
