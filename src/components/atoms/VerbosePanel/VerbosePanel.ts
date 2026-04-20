import { Button, Card, Tag } from 'antd'
import styled from 'styled-components'

export const DetailSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const KeyValueGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 160px) minmax(0, 1fr);
  gap: 8px 16px;
  align-items: start;
`

export const Label = styled.div`
  font-weight: 600;
`

export const Value = styled.div`
  min-width: 0;
  overflow-wrap: anywhere;
`

export const VerboseContainer = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  scrollbar-gutter: stable;
`

export const CustomCard = styled(Card)`
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

export const TitleAndControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  word-break: break-all;
`

export const TitleAndExpandCollapse = styled.div`
  display: flex;
  gap: 8px;
`

export const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
`

export const ExpandCollapseButton = styled(Button)`
  height: 24px;
  padding: 3px;
`

export const CloseButton = styled(Button)`
  height: 24px;
  padding: 3px;
`

export const OverflowContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const SpecGrid = styled.div`
  display: grid;
  grid-gap: 8px 16px;
  grid-template-columns: 120px 1fr;
  word-break: break-all;
`

export const DividerLine = styled.div<{ $backgroundColor: string }>`
  width: 100%;
  height: 1px;
  margin-top: 16px;
  margin-bottom: 16px;
  background: ${({ $backgroundColor }) => $backgroundColor};
`

export const SubtitleWithIcon = styled.div`
  display: flex;
  margin-bottom: 8px;
`

export const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
`

export const Subtitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
`

export const TreeContainer = styled.div`
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

export const InfoTag = styled(Tag)`
  margin-inline-end: 0;
  padding-inline: 10px;
  border-radius: 999px;
`

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const ViewMoreTag = styled.div`
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
