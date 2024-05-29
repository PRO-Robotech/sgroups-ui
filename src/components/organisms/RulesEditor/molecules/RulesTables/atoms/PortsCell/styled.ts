import styled from 'styled-components'
import { Tag } from 'antd'

export const InlineContainerWidthMaxWidth = styled.div`
  display: flex;
  flex-flow: row;
  max-width: 75px;
  overflow-x: hidden;
`

export const PortsEntry = styled(Tag)`
  display: flex;
`

const PopoverContainer = styled.div`
  display: grid;
  grid-row-gap: 5px;
`

export const Styled = {
  InlineContainerWidthMaxWidth,
  PortsEntry,
  PopoverContainer,
}
