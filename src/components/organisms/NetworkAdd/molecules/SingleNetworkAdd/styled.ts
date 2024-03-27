import styled from 'styled-components'
import { Form } from 'antd'

const Container = styled.div`
  display: grid;
  grid-gap: 15px;
  grid-template-columns: 1fr;
`

const FormItem = styled(Form.Item)`
  margin-bottom: 0;

  label {
    min-width: 150px;
  }
`

export const Styled = {
  Container,
  FormItem,
}
