import styled from 'styled-components'
import { Select } from 'antd'

const UncontrolledSelect = styled(Select)`
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  cursor: default;

  && input {
    /* stylelint-disable declaration-no-important */
    cursor: default !important;
  }

  && .ant-select-selector,
  && .ant-select-focused .ant-select-selector,
  && .ant-select-selector:focus,
  && .ant-select-selector:active,
  && .ant-select-open .ant-select-selector {
    border: 0 !important;
    border-color: transparent !important;
    outline: none !important;
    outline-color: transparent !important;
    box-shadow: none !important;
  }

  && .ant-select-selector {
    background: none;
    border: 0;
    cursor: default;
  }

  && .ant-select-selection-overflow-item-rest .ant-select-selection-item {
    color: #366af3;
    background: 0;
    border: 0;
  }
`

export const Styled = {
  UncontrolledSelect,
}
