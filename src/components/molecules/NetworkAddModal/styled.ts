import styled from 'styled-components'
import { Form } from 'antd'

export const CustomLabelsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 32px;
  grid-gap: 8px;
  margin-bottom: 4px;
`

export const FormItemsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 32px;
  grid-column-gap: 8px;
  margin-bottom: 12px;
`

export const ResetedFormItem = styled(Form.Item)`
  margin-bottom: 0;
`

export const Styled = {
  CustomLabelsContainer,
  FormItemsContainer,
  ResetedFormItem,
}
