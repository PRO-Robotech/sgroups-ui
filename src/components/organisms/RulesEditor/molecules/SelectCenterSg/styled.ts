import styled from 'styled-components'
import { Form } from 'antd'

type TGroupRulesNodeProps = {
  $notInTransformBlock?: boolean
}

const GroupRulesNode = styled.div<TGroupRulesNodeProps>`
  box-sizing: border-box;
  padding: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '15px 0' : '15px')};
  background: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : 'white')};
  border-radius: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '10px')};
  box-shadow: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : '0 0 24px rgba(23, 49, 65, 0.13)')};
`

const Directions = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const FormItem = styled(Form.Item)`
  margin-bottom: 5px;

  label {
    min-width: 150px;
  }
`

export const Styled = {
  GroupRulesNode,
  Directions,
  FormItem,
}
