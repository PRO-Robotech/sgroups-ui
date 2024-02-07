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

    @media (min-width: 1440px) {
      min-width: 100px;
    }
  }
`

export const Styled = {
  Container,
  FormItem,
}
