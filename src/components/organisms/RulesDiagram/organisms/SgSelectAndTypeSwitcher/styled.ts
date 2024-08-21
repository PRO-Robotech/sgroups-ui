import styled from 'styled-components'
import { Form } from 'antd'

type TContainerProps = {
  $isHidden: boolean
}

const Container = styled.div<TContainerProps>`
  display: ${({ $isHidden }) => ($isHidden ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
`

export const CustomFormItem = styled(Form.Item)`
  min-width: 200px;
  margin-right: 16px;
  margin-bottom: 0;
  margin-left: 8px;
`

export const Styled = {
  Container,
  CustomFormItem,
}
