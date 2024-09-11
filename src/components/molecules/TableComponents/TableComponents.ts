import styled from 'styled-components'

type TTableContainerProps = {
  $isDark?: boolean
}

const TableContainer = styled.div<TTableContainerProps>`
  padding: 24px;

  && .ant-table-container {
    border: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#f0f0f0')};
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
    border: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#f0f0f0')};
    border-radius: 0 0 8px 8px;
    border-top: 0;
    margin: 0;
    padding: 8px 16px;
  }

  && .ant-pagination-total-text {
    position: absolute;
    right: 16px;
  }

  && .ant-table-expanded-row-fixed {
    width: auto !important;
  }
`
type TTableContainerRulesProps = {
  $isDark?: boolean
}

const TableContainerRules = styled.div<TTableContainerRulesProps>`
  width: 100% !important;

  && .ant-table-container {
    border: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#f0f0f0')};
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
    border: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#f0f0f0')};
    border-radius: 0 0 8px 8px;
    border-top: 0;
    margin: 0;
    padding: 8px 16px;
  }

  && .ant-pagination-total-text {
    position: absolute;
    right: 16px;
  }

  && .ant-table-expanded-row-fixed {
    width: auto !important;
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
  TableContainerRules,
  HideableControls,
}
