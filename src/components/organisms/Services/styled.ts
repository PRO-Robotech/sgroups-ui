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
  DividerLine,
  ExpandCollapseButton,
  Icon,
  InfoTag,
  OverflowContainer,
  SpecGrid,
  Subtitle,
  SubtitleWithIcon,
  TagsContainer,
  Title,
  TitleAndControlsRow,
  TitleAndExpandCollapse,
  VerboseContainer,
  ViewMoreTag,
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
  InfoTag,
  TagsContainer,
  ViewMoreTag,
  BottomActionBar,
}
