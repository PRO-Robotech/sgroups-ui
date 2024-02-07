import styled from 'styled-components'

const Constrols = styled.div`
  display: flex;
  flex-flow: column;

  @media (min-width: 1024px) {
    flex-flow: row;
    justify-content: flex-end;
  }
`

const UndoButton = styled.div`
  width: 50px;
`

const SegmentedContainer = styled.div`
  overflow-x: auto;
`

export const Styled = {
  Constrols,
  UndoButton,
  SegmentedContainer,
}
