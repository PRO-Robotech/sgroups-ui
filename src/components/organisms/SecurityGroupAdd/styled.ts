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

type TGenerativeFormItemProps = {
  $isFirst: boolean
  $isMany: boolean
}

const GenerativeFormItem = styled(Form.Item)<TGenerativeFormItemProps>`
  margin-bottom: 0;
  margin-left: ${({ $isFirst }) => ($isFirst ? '0' : '150')}px;

  label {
    min-width: 150px;
  }

  .ant-form-item-control-input-content {
    display: grid;
    grid-template-columns: ${({ $isMany }) => ($isMany ? '1fr 50px' : '1fr')};
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const TMarginLeftButtonFormItem = styled(Form.Item)`
  margin-left: 150px;
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
  GenerativeFormItem,
  TMarginLeftButtonFormItem,
  ButtonFormItem,
}
