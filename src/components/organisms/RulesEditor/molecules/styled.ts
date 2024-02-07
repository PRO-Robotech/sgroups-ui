import styled from 'styled-components'
import { Form } from 'antd'

const GroupRulesNode = styled.div`
  width: 700px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 24px rgba(23, 49, 65, 0.13);

  .ant-table-placeholder {
    display: none;
  }
`

const FormItem = styled(Form.Item)`
  margin-top: 15px;
  margin-bottom: 5px;

  label {
    min-width: 150px;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`

const ButtonWithRightMargin = styled.div`
  margin-right: 10px;
`

type TRulesEntryTransportProps = {
  $transport: string
}

const RulesEntryTransport = styled.div<TRulesEntryTransportProps>`
  padding: 3px;
  text-align: center;
  background: ${({ $transport }) => ($transport === 'TCP' ? '#c1f1c3d9' : '#c1d4f1d9')};
  border-left: 1px solid #cbcbcb;
  border-radius: 5px;
`

const RulesEntrySgs = styled.div`
  width: 100%;
  padding: 3px;
  word-break: break-all;
`

const RulesEntryMarks = styled.div`
  min-width: fit-content;
  padding: 5px 5px;
`

const RulesEntryPorts = styled.div`
  padding: 3px;
  text-align: center;
  background: #e9e9e9;
  border-left: 1px solid #cbcbcb;
  border-radius: 5px;
`

export const Styled = {
  GroupRulesNode,
  FormItem,
  ButtonsContainer,
  ButtonWithRightMargin,
  RulesEntryTransport,
  RulesEntrySgs,
  RulesEntryMarks,
  RulesEntryPorts,
}
