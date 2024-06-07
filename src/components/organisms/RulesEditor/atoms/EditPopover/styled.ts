import styled from 'styled-components'
import { Form } from 'antd'

const Container = styled.div`
  width: 360px;
`

const FormItem = styled(Form.Item)`
  margin-bottom: 5px;

  label {
    min-width: 150px;
  }
`

const PortsEditContainer = styled.div`
  max-height: 250px;
  overflow-x: auto;
`

const PortFormItemsContainer = styled.div`
  display: grid;
  grid-row-gap: 10px;
  padding: 10px;
  border: 1px solid gainsboro;
  border-radius: 10px;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`

const ButtonWithRightMargin = styled.div`
  margin-right: 10px;
`

export const Styled = {
  Container,
  FormItem,
  PortsEditContainer,
  PortFormItemsContainer,
  ButtonsContainer,
  ButtonWithRightMargin,
}
