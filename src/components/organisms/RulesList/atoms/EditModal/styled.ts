import styled from 'styled-components'
import { Form } from 'antd'

export const ResetedFormItem = styled(Form.Item)`
  margin-bottom: 0;
`

const PortsEditContainer = styled.div`
  max-height: 242px;
  overflow-x: auto;
  border: 1px solid #0000000f;
  border-radius: 8px;
  padding: 8px 12px 12px 12px;
`

export const CustomLabelsContainer = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 1fr 1fr 32px;
  margin-bottom: 4px;
`

const PortFormItemsContainer = styled.div`
  display: grid;
  grid-column-gap: 8px;
  grid-template-columns: 1fr 1fr 32px;
  margin-bottom: 12px;
`

export const Styled = {
  ResetedFormItem,
  PortsEditContainer,
  CustomLabelsContainer,
  PortFormItemsContainer,
}
