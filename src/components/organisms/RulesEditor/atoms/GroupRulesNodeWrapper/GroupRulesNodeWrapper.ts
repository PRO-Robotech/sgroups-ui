import styled, { keyframes } from 'styled-components'

const bgSpin = keyframes`
  to {
      --border-angle: 1turn;
  }
`

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
  /* background: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : 'white')}; */
  border-radius: ${({ $notInTransformBlock }) => ($notInTransformBlock ? '0' : '10px')};
  box-shadow: ${({ $notInTransformBlock }) => ($notInTransformBlock ? 'none' : '0 0 24px rgba(23, 49, 65, 0.13)')};
  display: flex;
  flex-flow: column;
  box-sizing: border-box;

  --border-angle: 0turn;
  --main-bg: conic-gradient(from var(--border-angle), #fff, #fff 5%, #fff 60%, #fff 95%);

  border: solid 3px transparent;
  border-radius: 2em;
  --gradient-border: conic-gradient(from var(--border-angle), transparent 25%, #60b4fd, #f03 99%, transparent);

  background: ${({ $notInTransformBlock, $isCenterSg }) => {
    if ($notInTransformBlock) {
      return 'none'
    }
    if ($isCenterSg) {
      return 'var(--main-bg) padding-box, var(--gradient-border) border-box, var(--main-bg) border-box'
    }
    return 'white'
  }};

  background-position: center center;

  animation: ${bgSpin} 10s linear infinite;

  @property --border-angle {
    syntax: '<angle>';
    inherits: true;
    initial-value: 0turn;
  }
`
