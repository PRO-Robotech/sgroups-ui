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
const ButtonFormItem = styled(Form.Item)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;

  @media (min-width: 1440px) {
    justify-content: flex-start;
    margin-top: 0;
  }

  button {
    margin-right: 15px;

    &:last-child {
      margin-right: 0;
    }
  }
`

export const Styled = {
  Container,
  FormItem,
  ButtonFormItem,
}
