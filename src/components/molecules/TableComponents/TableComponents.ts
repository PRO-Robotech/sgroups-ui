import styled from 'styled-components'

const TableContainer = styled.div`
  padding: 24px;

  && .ant-table-container {
    border: 1px solid #f0f0f0;
    border-bottom: 0;
  }

  && .ant-table-cell {
    font-size: 14px;
    line-height: 22px;
    padding: 8px 16px;
  }

  && thead .ant-table-cell {
    padding: 13px 16px;
  }

  && .controls {
    padding: 6px 16px;
  }

  && .ant-table-pagination {
    border: 1px solid #f0f0f0;
    border-radius: 0 0 8px 8px;
    border-top: 0;
    margin: 0;
    padding: 8px 16px;
  }

  && .ant-pagination-total-text {
    position: absolute;
    right: 16px;
  }
`

const HideableControls = styled.div`
  && .ant-table-row .hideable {
    display: none;
  }

  && .ant-table-row:hover .hideable {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 4px;
  }
`

export const TableComponents = {
  TableContainer,
  HideableControls,
}
