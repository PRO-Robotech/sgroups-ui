import styled from 'styled-components'
import { Button } from 'antd'

const ButtonWithMarginLeft = styled(Button)`
  margin-left: 10px;
`

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 50px;
`

export const Styled = {
  ButtonWithMarginLeft,
  FiltersContainer,
}
