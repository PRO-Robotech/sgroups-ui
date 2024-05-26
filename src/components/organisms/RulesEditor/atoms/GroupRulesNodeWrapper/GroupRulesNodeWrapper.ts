import styled from 'styled-components'

type TGroupRulesNodeWrapperProps = {
  $notInTransformBlock?: boolean
}

export const GroupRulesNodeWrapper = styled.div<TGroupRulesNodeWrapperProps>`
  width: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '100%' : '1000px')};
  padding: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '15px')};
  background: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : 'white')};
  border-radius: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '10px')};
  box-shadow: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : '0 0 24px rgba(23, 49, 65, 0.13)')};
`
