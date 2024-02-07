import styled from 'styled-components'
import { Form } from 'antd'

const GroupRulesNode = styled.div`
  width: 400px;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
`

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
  GroupRulesNode,
  FormItem,
  ButtonsContainer,
  ButtonWithRightMargin,
}
