import React, { FC, useEffect } from 'react'
import ReactFlow, { useReactFlow, useNodesInitialized, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import { TEntry } from 'localTypes/graph'
import { nodeTypes, edgeTypes } from '../../helpers'
import { makeLowLevelFlow } from '../../utils'
import { Styled } from '../../styled'

type TLowLevelFlowProps = {
  data: TEntry[]
  selectedSg: string[]
  isExtended: boolean
  selectedNW?: string
}

export const LowLevelFlow: FC<TLowLevelFlowProps> = ({ data, selectedSg, selectedNW, isExtended }) => {
  const { nodes, edges } = makeLowLevelFlow(data, selectedSg)

  const reactFlowInstance = useReactFlow()
  const nodesInitialized = useNodesInitialized()

  useEffect(() => {
    if (nodesInitialized) {
      setTimeout(() => reactFlowInstance.fitView(), 0)
    }
  }, [reactFlowInstance, nodesInitialized, data, selectedSg, selectedNW, isExtended])

  return (
    <Styled.DefaultCursorEdges>
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Controls />
      </ReactFlow>
    </Styled.DefaultCursorEdges>
  )
}
