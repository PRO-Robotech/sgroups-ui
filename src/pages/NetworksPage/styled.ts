import { Button, Card, Tag } from 'antd'
import styled, { css } from 'styled-components'

const DETAIL_PANEL_MIN_WIDTH = 320

const SplitLayout = styled.div<{
  $detailWidth?: number
  $isDetailOpen: boolean
}>`
  display: grid;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--networks-border-color, #d9d9d9);
  border-radius: 12px;
  background: var(--networks-bg-color, white);
  grid-template-columns: minmax(0, 1fr);

  ${({ $isDetailOpen, $detailWidth }) =>
    $isDetailOpen &&
    css`
      grid-template-columns: minmax(0, 1fr) 10px minmax(${DETAIL_PANEL_MIN_WIDTH}px, ${$detailWidth || 420}px);
    `}

  @media (width <= 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const TablePane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
  }

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ant-table-container {
    flex: 1;
  }

  .ant-table-tbody > .network-row-selected > td {
    background: var(--networks-row-selected-bg, #e6f4ff);
  }

  .ant-table-tbody > .network-row-selected:hover > td {
    background: var(--networks-row-selected-hover-bg, #bae0ff);
  }
`

const ResizeHandle = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  cursor: col-resize;
  background: var(--networks-layout-bg, whitesmoke);

  &:before {
    content: '';
    width: 2px;
    margin: 0 auto;
    border-radius: 999px;
    background: var(--networks-border-color, #d9d9d9);
  }

  @media (width <= 1100px) {
    display: none;
  }
`

const DetailPane = styled.aside`
  height: 100%;
  min-width: 0;
  overflow: auto;
  border-left: 1px solid var(--networks-border-secondary-color, #f0f0f0);

  @media (width <= 1100px) {
    display: none;
  }
`

const MobileDetailPane = styled.div`
  display: none;

  @media (width <= 1100px) {
    display: block;
    border: 1px solid var(--networks-border-color, #d9d9d9);
    border-radius: 12px;
    overflow: hidden;
  }
`

const VerboseContainer = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  scrollbar-gutter: stable;
`

const CustomCard = styled(Card)`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .ant-card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 16px 24px;
  }
`

const TitleAndControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  word-break: break-all;
`

const TitleAndExpandCollapse = styled.div`
  display: flex;
  gap: 8px;
`

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
`

const ExpandCollapseButton = styled(Button)`
  height: 24px;
  padding: 3px;
`

const CloseButton = styled(Button)`
  height: 24px;
  padding: 3px;
`

const OverflowContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const SpecGrid = styled.div`
  display: grid;
  grid-gap: 8px 16px;
  grid-template-columns: 120px 1fr;
  word-break: break-all;
`

const DividerLine = styled.div<{ $backgroundColor: string }>`
  width: 100%;
  height: 1px;
  margin-top: 16px;
  margin-bottom: 16px;
  background: ${({ $backgroundColor }) => $backgroundColor};
`

const SubtitleWithIcon = styled.div`
  display: flex;
  margin-bottom: 8px;
`

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
`

const Subtitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
`

const TreeContainer = styled.div`
  overflow-y: auto;

  .ant-tree-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-tree-switcher:before {
    top: initial !important;
  }

  .ant-tree .ant-tree-node-content-wrapper {
    overflow-wrap: anywhere;
  }
`

const InfoTag = styled(Tag)`
  margin-inline-end: 0;
  padding-inline: 10px;
  border-radius: 999px;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ViewMoreTag = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  margin-top: 6px;
  cursor: pointer;
  user-select: none;

  svg {
    margin-left: 4px;
  }
`

export const Styled = {
  DETAIL_PANEL_MIN_WIDTH,
  SplitLayout,
  TablePane,
  ResizeHandle,
  DetailPane,
  MobileDetailPane,
  VerboseContainer,
  CustomCard,
  TitleAndControlsRow,
  TitleAndExpandCollapse,
  Title,
  ExpandCollapseButton,
  CloseButton,
  OverflowContainer,
  SpecGrid,
  DividerLine,
  SubtitleWithIcon,
  Icon,
  Subtitle,
  TreeContainer,
  InfoTag,
  TagsContainer,
  ViewMoreTag,
}
