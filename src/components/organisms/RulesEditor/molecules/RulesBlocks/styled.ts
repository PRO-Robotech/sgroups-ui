import styled from 'styled-components'
import { Form } from 'antd'

const GroupRulesNode = styled.div`
  width: 1000px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);
`

const FormItem = styled(Form.Item)`
  margin-top: 15px;
  margin-bottom: 5px;

  label {
    min-width: 150px;
  }
`

export const Styled = {
  GroupRulesNode,
  FormItem,
}
