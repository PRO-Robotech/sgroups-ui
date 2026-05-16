import styled, { css } from 'styled-components'

export const DETAIL_PANEL_MIN_WIDTH = 320
export const DETAIL_PANEL_SPLITTER_WIDTH = 10

export type TSplitLayoutProps = {
  $detailWidth?: number
  $isDetailOpen: boolean
}

const MIN_TABLE_PAGE_HEIGHT = 240

export const TablePageShell = styled.div<{ $height: number }>`
  --enriched-table-scrollbar-bottom-offset: 0px;

  display: flex;
  flex-direction: column;
  height: ${({ $height }) => Math.max(MIN_TABLE_PAGE_HEIGHT, $height)}px;
  min-height: 0;
`

export const SplitLayout = styled.div<TSplitLayoutProps>`
  display: grid;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--table-splitter-border-color, #d9d9d9);
  border-radius: 12px;
  background: var(--table-splitter-bg-color, white);
  grid-template-columns: minmax(0, 1fr);

  ${({ $isDetailOpen, $detailWidth }) =>
    $isDetailOpen &&
    css`
      grid-template-columns: minmax(0, 1fr) ${DETAIL_PANEL_SPLITTER_WIDTH}px minmax(
          ${DETAIL_PANEL_MIN_WIDTH}px,
          ${$detailWidth || 420}px
        );
    `}

  @media (width <= 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const TablePane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;

  > div,
  > div > div {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container {
    flex: 1;
    min-height: 0;
    min-width: 0;
  }

  .ant-table-body {
    overflow: auto !important;
  }

  .ant-table-tbody > .address-group-row-selected > td,
  .ant-table-tbody > .host-row-selected > td,
  .ant-table-tbody > .network-row-selected > td,
  .ant-table-tbody > .rule-row-selected > td,
  .ant-table-tbody > .service-row-selected > td {
    background: var(--table-splitter-row-selected-bg, #e6f4ff);
  }

  .ant-table-tbody > .address-group-row-selected:hover > td,
  .ant-table-tbody > .host-row-selected:hover > td,
  .ant-table-tbody > .network-row-selected:hover > td,
  .ant-table-tbody > .rule-row-selected:hover > td,
  .ant-table-tbody > .service-row-selected:hover > td {
    background: var(--table-splitter-row-selected-hover-bg, #bae0ff);
  }
`

export const ResizeHandle = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  cursor: col-resize;
  background: var(--table-splitter-bg-color, white);

  &:before {
    content: '';
    width: 2px;
    margin: 0 auto;
    border-radius: 999px;
    background: var(--table-splitter-border-color, #d9d9d9);
  }

  @media (width <= 1100px) {
    display: none;
  }
`

export const DetailPane = styled.aside`
  height: 100%;
  min-width: 0;
  overflow: hidden;
  border-left: 1px solid var(--table-splitter-border-secondary-color, #f0f0f0);

  @media (width <= 1100px) {
    display: none;
  }
`

export const MobileDetailPane = styled.div`
  display: none;

  @media (width <= 1100px) {
    display: block;
    height: min(520px, 50vh);
    min-height: 0;
    border: 1px solid var(--table-splitter-border-color, #d9d9d9);
    border-radius: 12px;
    overflow: hidden;
  }
`
