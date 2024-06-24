import styled from 'styled-components'
import { Select } from 'antd'

const SelectedItemsText = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
  font-size: 16px;
  line-height: 24px;
`

const UncontrolledSelect = styled(Select)`
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  margin: 0;

  && .ant-select-selector {
    border: 0;
    background: none;
    cursor: default;
  }

  && .ant-select-selection-overflow-item-rest .ant-select-selection-item {
    border: 0;
    background: 0;
    color: #366af3;
  }
`

export const Styled = {
  SelectedItemsText,
  UncontrolledSelect,
}
