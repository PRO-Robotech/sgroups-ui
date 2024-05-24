import styled from 'styled-components'

const RadioGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

type TGroupRulesNode = {
  $notInTransformBlock?: boolean
}

const GroupRulesNode = styled.div<TGroupRulesNode>`
  width: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '100%' : '1000px')};
  padding: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '15px')};
  background: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : 'white')};
  border-radius: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '10px')};
  box-shadow: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : '0 0 24px rgba(23, 49, 65, 0.13)')};
`

const ContainerAfterSwitcher = styled.div`
  margin-top: -35px;
`

export const Styled = {
  RadioGroup,
  GroupRulesNode,
  ContainerAfterSwitcher,
}
