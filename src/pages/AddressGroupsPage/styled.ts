import { Button, Card, Tag } from 'antd'
import styled, { css } from 'styled-components'

const DETAIL_PANEL_MIN_WIDTH = 320

const SplitLayout = styled.div<{
  $detailWidth?: number
  $isDetailOpen: boolean
}>`
  display: grid;
  min-height: 520px;
  overflow: hidden;
  border: 1px solid var(--address-groups-border-color, #d9d9d9);
  border-radius: 12px;
  background: var(--address-groups-bg-color, white);
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
  min-width: 0;
  overflow: hidden;

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
  }

  .ant-table {
    height: 100%;
  }

  .ant-table-tbody > .address-group-row-selected > td {
    background: var(--address-groups-row-selected-bg, #e6f4ff);
  }

  .ant-table-tbody > .address-group-row-selected:hover > td {
    background: var(--address-groups-row-selected-hover-bg, #bae0ff);
  }
`

const ResizeHandle = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  cursor: col-resize;
  background: var(--address-groups-layout-bg, whitesmoke);

  &:before {
    content: '';
    width: 2px;
    margin: 0 auto;
    border-radius: 999px;
    background: var(--address-groups-border-color, #d9d9d9);
  }

  @media (width <= 1100px) {
    display: none;
  }
`

const DetailPane = styled.aside`
  min-width: 0;
  overflow: auto;
  border-left: 1px solid var(--address-groups-border-secondary-color, #f0f0f0);

  @media (width <= 1100px) {
    display: none;
  }
`

const MobileDetailPane = styled.div`
  display: none;

  @media (width <= 1100px) {
    display: block;
    border: 1px solid var(--address-groups-border-color, #d9d9d9);
    border-radius: 12px;
    overflow: hidden;
  }
`

const DetailSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const KeyValueGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 160px) minmax(0, 1fr);
  gap: 8px 16px;
  align-items: start;
`

const Label = styled.div`
  font-weight: 600;
`

const Value = styled.div`
  min-width: 0;
  overflow-wrap: anywhere;
`

const VerboseContainer = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 114px);
  scrollbar-gutter: stable;
`

const CustomCard = styled(Card)`
  max-height: calc(100vh - 158px);

  .ant-card-body {
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

const OverflowContainer = styled.div<{ $height: number }>`
  max-height: ${({ $height }) => $height}px;
  overflow-y: auto;
`

const SpecGrid = styled.div`
  display: grid;
  grid-row-gap: 8px;
  grid-column-gap: 16px;
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

export const Styled = {
  DETAIL_PANEL_MIN_WIDTH,
  SplitLayout,
  TablePane,
  ResizeHandle,
  DetailPane,
  MobileDetailPane,
  DetailSection,
  KeyValueGrid,
  Label,
  Value,
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
}
