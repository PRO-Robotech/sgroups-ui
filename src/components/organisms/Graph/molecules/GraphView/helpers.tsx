/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useCallback } from 'react'
import { Tooltip } from 'antd'
import { Handle, Position, useStore, getBezierPath } from 'reactflow'
import { SmartBezierEdge } from '@tisoap/react-flow-smart-edge'
import { getEdgeParams } from './utils/floatingEdgeUtils'
import { Styled } from './styled'
import type { TSimpleFloatingEdge } from './types'

const SplittedText: FC<{ text: string }> = ({ text }) => {
  const splittedText = text.split('.')[0]
  return <Tooltip title={text}>{splittedText}</Tooltip>
}

const EnshortenedText: FC<{ text: string; maxCustomSize?: number }> = ({ text, maxCustomSize }) => {
  const splittedText = text.split('.')[0]
  if (maxCustomSize && text.length > maxCustomSize) {
    return (
      <Tooltip title={text}>
        {splittedText.slice(0, Math.ceil(maxCustomSize / 2))}...{splittedText.slice(-Math.ceil(maxCustomSize / 2))}
      </Tooltip>
    )
  }
  if (text.length > 10) {
    return (
      <Tooltip title={text}>
        {splittedText.slice(0, 5)}...{splittedText.slice(-5)}
      </Tooltip>
    )
  }
  if (text.length > 6) {
    return (
      <Tooltip title={text}>
        {splittedText.slice(0, 3)}...{splittedText.slice(-3)}
      </Tooltip>
    )
  }
  return <div>{text}</div>
}

export const GroupHighLevelNode: FC<{ data: any }> = ({ data }) => (
  <Styled.GroupHighLevelNodeContainer $labelSize={data?.label.length} $handleType={data?.handleType}>
    <SplittedText text={data?.label} />
    <Handle type="source" isConnectable={false} position={Position.Top} id="a" />
    <Handle type="source" isConnectable={false} position={Position.Right} id="b" />
    <Handle type="source" isConnectable={false} position={Position.Bottom} id="c" />
    <Handle type="source" isConnectable={false} position={Position.Left} id="d" />
    <Handle type="target" isConnectable={false} position={Position.Top} id="a" />
    <Handle type="target" isConnectable={false} position={Position.Right} id="b" />
    <Handle type="target" isConnectable={false} position={Position.Bottom} id="c" />
    <Handle type="target" isConnectable={false} position={Position.Left} id="d" />
  </Styled.GroupHighLevelNodeContainer>
)

export const GroupStarNode: FC<{ data: any }> = ({ data }) => (
  <Styled.GroupStarNodeContainer $labelSize={data?.label.length}>
    <SplittedText text={data?.label} />
    <Handle type="source" isConnectable={false} position={Position.Top} id="a" />
    <Handle type="source" isConnectable={false} position={Position.Right} id="b" />
    <Handle type="source" isConnectable={false} position={Position.Bottom} id="c" />
    <Handle type="source" isConnectable={false} position={Position.Left} id="d" />
    <Handle type="target" isConnectable={false} position={Position.Top} id="a" />
    <Handle type="target" isConnectable={false} position={Position.Right} id="b" />
    <Handle type="target" isConnectable={false} position={Position.Bottom} id="c" />
    <Handle type="target" isConnectable={false} position={Position.Left} id="d" />
  </Styled.GroupStarNodeContainer>
)

export const GroupProtocolNode: FC<{ data: any }> = ({ data }) => (
  <Styled.GroupProtocolNodeContainer>
    <EnshortenedText maxCustomSize={16} text={data?.label} />
  </Styled.GroupProtocolNodeContainer>
)

export const ProtocolNodeLeft: FC<{ data: any }> = ({ data }) => (
  <Styled.ProtocolNodeContainer $handleType={data?.handleType} $type="left">
    <EnshortenedText text={data?.label} />
    <Handle type="source" isConnectable={false} position={Position.Right} />
    <Handle type="target" isConnectable={false} position={Position.Right} />
  </Styled.ProtocolNodeContainer>
)

export const ProtocolNodeRight: FC<{ data: any }> = ({ data }) => (
  <Styled.ProtocolNodeContainer $handleType={data?.handleType} $type="right">
    {data?.label}
    <Handle type="source" isConnectable={false} position={Position.Left} />
    <Handle type="target" isConnectable={false} position={Position.Left} />
  </Styled.ProtocolNodeContainer>
)

export const NetworkNode: FC<{ data: any }> = ({ data }) => (
  <Styled.NetworkNodeContainer>{data?.label}</Styled.NetworkNodeContainer>
)

export const IpAndProtocolNodeLeft: FC<{ data: any }> = ({ data }) => (
  <Styled.IpAndProtocolNodeContainer $handleType={data?.handleType}>
    {data?.label}
    <Handle type="source" isConnectable={false} position={Position.Right} />
    <Handle type="target" isConnectable={false} position={Position.Right} />
  </Styled.IpAndProtocolNodeContainer>
)

export const IpAndProtocolNodeRight: FC<{ data: any }> = ({ data }) => (
  <Styled.IpAndProtocolNodeContainer $handleType={data?.handleType}>
    {data?.label}
    <Handle type="source" isConnectable={false} position={Position.Left} />
    <Handle type="target" isConnectable={false} position={Position.Left} />
  </Styled.IpAndProtocolNodeContainer>
)

export const SimpleFloatingEdge: FC<TSimpleFloatingEdge> = ({ id, source, target, markerEnd, style }) => {
  const sourceNode = useStore(useCallback(store => store.nodeInternals.get(source), [source]))
  const targetNode = useStore(useCallback(store => store.nodeInternals.get(target), [target]))

  if (!sourceNode || !targetNode) {
    return null
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode)

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  })

  const hitboxStyle = { strokeWidth: 15 }

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={5}
        markerEnd={markerEnd}
        style={style}
      />
      <path id={id} d={edgePath} strokeWidth={5} fill="none" style={hitboxStyle} />
    </>
  )
}

export const nodeTypes = {
  groupHighLevelNode: GroupHighLevelNode,
  groupStarNode: GroupStarNode,
  groupProtocolNode: GroupProtocolNode,
  protocolNodeLeft: ProtocolNodeLeft,
  protocolNodeRight: ProtocolNodeRight,
  networkNode: NetworkNode,
  ipAndProtocolNodeLeft: IpAndProtocolNodeLeft,
  ipAndProtocolNodeRight: IpAndProtocolNodeRight,
}

export const edgeTypes = {
  smart: SmartBezierEdge,
  floating: SimpleFloatingEdge,
}
