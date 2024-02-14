import styled from 'styled-components'
import { Form } from 'antd'

const FormItem = styled(Form.Item)`
  margin-bottom: 5px;

  label {
    min-width: 150px;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`

const ButtonWithRightMargin = styled.div`
  margin-right: 10px;
`

export const Styled = {
  FormItem,
  ButtonsContainer,
  ButtonWithRightMargin,
}
