import styled from 'styled-components'

const Background = styled.div`
  width: 100%;
  height: 100%;
`

const DefaultCursorEdges = styled.div`
  .react-flow__edge {
    cursor: default;
  }
`

type TReacFlowContainerProps = {
  $isHighLevel?: boolean
}

const ReactFlowContainer = styled.div<TReacFlowContainerProps>`
  width: 100%;
  height: calc(100% - 50px);
  padding: 15px;
  background: #f0f4f8;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .react-flow__node {
    z-index: ${({ $isHighLevel }) => ($isHighLevel ? 'initial' : '-1 !important;')};
  }
`

type TGroupHighLevelNodeContainerProps = {
  $labelSize?: number
  $handleType?: string
}

const GroupHighLevelNodeContainer = styled.div<TGroupHighLevelNodeContainerProps>`
  width: 100px;
  padding: 5px 0;
  font-size: ${({ $labelSize }) => {
    if ($labelSize) {
      if ($labelSize > 10) {
        return '8px'
      }
    }
    return '12px'
  }};
  text-align: center;
  background: white;
  border: 1px solid #bbbcbc;
  border-color: #90ee939c;
  border-radius: 3px;
  cursor: pointer;

  .react-flow__handle.target,
  .react-flow__handle.source {
    visibility: hidden;
  }
`

type TGroupStarNodeContainerProps = {
  $labelSize?: number
}

const GroupStarNodeContainer = styled.div<TGroupStarNodeContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  padding: 5px 0;
  color: #303030;
  font-size: ${({ $labelSize }) => {
    if ($labelSize) {
      if ($labelSize > 10) {
        return '8px'
      }
    }
    return '12px'
  }};
  text-align: center;
  background: white;
  border: 1px solid #bbbcbc;
  border-radius: 50%;
  cursor: pointer;

  .react-flow__handle.target,
  .react-flow__handle.source {
    visibility: hidden;
  }
`

const GroupProtocolNodeContainer = styled.div`
  height: 100%;
  color: #65646d;
  font-weight: 700;
  text-align: center;
  background: #ebeef0;
  border: 1px dashed #9ba1a8;
  border-radius: 3px;
  cursor: default;
`

type TProtocolNodeContainerProps = {
  $handleType?: string
  $type?: string
}

const ProtocolNodeContainer = styled.div<TProtocolNodeContainerProps>`
  width: 100px;
  padding: 5px 7px;
  color: #303030;
  font-size: 12px;
  text-align: ${({ $type }) => ($type === 'left' ? 'right' : 'left')};
  cursor: pointer;

  .react-flow__handle.target {
    display: ${({ $handleType }) => ($handleType === 'target' ? 'block' : 'none')};
  }

  .react-flow__handle.source {
    display: ${({ $handleType }) => ($handleType === 'source' ? 'block' : 'none')};
    border-radius: 0;
  }

  .react-flow__handle.source,
  .react-flow__handle.target {
    background-color: #90ee939c;
  }
`

const NetworkNodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 25px;
  padding: 5px 0;
  color: #303030;
  font-size: 12px;
  text-align: center;
  background: #f6ffed;
  border: 1px dashed #bbbcbc;
  border-radius: 3px;
  cursor: pointer;
`

type TIpAndProtocolNodeContainerProps = {
  $handleType?: string
}

const IpAndProtocolNodeContainer = styled.div<TIpAndProtocolNodeContainerProps>`
  width: 150px;
  padding: 5px 0;
  color: #303030;
  font-size: 12px;
  text-align: center;
  background: white;
  border: 1px solid #bbbcbc;
  border-radius: 3px;
  cursor: default;

  .react-flow__handle.target {
    display: ${({ $handleType }) => ($handleType === 'target' ? 'block' : 'none')};
  }

  .react-flow__handle.source {
    display: ${({ $handleType }) => ($handleType === 'source' ? 'block' : 'none')};
    border-radius: 0;
  }

  .react-flow__handle.source,
  .react-flow__handle.target {
    background-color: #90ee939c;
  }
`

export const Styled = {
  Background,
  DefaultCursorEdges,
  ReactFlowContainer,
  GroupHighLevelNodeContainer,
  GroupStarNodeContainer,
  GroupProtocolNodeContainer,
  ProtocolNodeContainer,
  NetworkNodeContainer,
  IpAndProtocolNodeContainer,
}
