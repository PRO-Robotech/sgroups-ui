import styled from 'styled-components'
import {
  DETAIL_PANEL_MIN_WIDTH,
  DETAIL_PANEL_SPLITTER_WIDTH,
  DetailPane,
  MobileDetailPane,
  ResizeHandle,
  SplitLayout,
  TablePane,
} from '../../atoms/TableSplitters'
import {
  CloseButton,
  CustomCard,
  DetailSection,
  DividerLine,
  ExpandCollapseButton,
  Icon,
  InfoTag,
  KeyValueGrid,
  Label,
  OverflowContainer,
  SpecGrid,
  Subtitle,
  SubtitleWithIcon,
  TagsContainer,
  Title,
  TitleAndControlsRow,
  TitleAndExpandCollapse,
  TreeContainer,
  Value,
  VerboseContainer,
} from '../../atoms/VerbosePanel'

const BottomActionBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  flex: 0 0 auto;
  padding: 4px;
  background: var(--table-splitter-bg-color, white);
`

export const Styled = {
  DETAIL_PANEL_MIN_WIDTH,
  DETAIL_PANEL_SPLITTER_WIDTH,
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
  BottomActionBar,
}
