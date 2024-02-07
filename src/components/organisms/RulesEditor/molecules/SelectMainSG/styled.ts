import styled from 'styled-components'
import { Form } from 'antd'

const GroupRulesNode = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
`

const FormItem = styled(Form.Item)`
  margin-bottom: 5px;

  label {
    min-width: 150px;
  }
`

export const Styled = {
  GroupRulesNode,
  FormItem,
}
