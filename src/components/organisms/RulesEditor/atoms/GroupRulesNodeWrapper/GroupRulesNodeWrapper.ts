import styled from 'styled-components'

type TGroupRulesNodeWrapperProps = {
  $notInTransformBlock?: boolean
  $isCenterSg?: boolean
}

export const GroupRulesNodeWrapper = styled.div<TGroupRulesNodeWrapperProps>`
  width: ${({ $notInTransformBlock, $isCenterSg }) => {
    if ($notInTransformBlock) {
      return '100%'
    }
    return $isCenterSg ? '400px' : '1000px'
  }};
  height: ${({ $isCenterSg }) => ($isCenterSg ? '150px' : '455px')};
  padding: ${({ $notInTransformBlock, $isCenterSg }) => {
    if ($notInTransformBlock && $isCenterSg) {
      return '20px 0 15px 0'
    }
    return $notInTransformBlock ? '0' : '15px'
  }};
  background: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : 'white')};
  border-radius: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '10px')};
  box-shadow: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : '0 0 24px rgba(23, 49, 65, 0.13)')};
  display: flex;
  flex-flow: column;
  box-sizing: border-box;
`
