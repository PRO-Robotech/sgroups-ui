import React, { FC, useEffect } from 'react'
import ReactFlow, { useReactFlow, useNodesInitialized, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import { TEntry } from 'localTypes/graph'
import { nodeTypes, edgeTypes } from '../../helpers'
import { makeStarFlow } from '../../utils'

type TStarFlowProps = {
  data: TEntry[]
  selectedSg: string[]
  onSelectSg: (values: string[]) => void
  isExtended: boolean
  selectedNW?: string
}

export const StarFlow: FC<TStarFlowProps> = ({ data, selectedSg, onSelectSg, selectedNW, isExtended }) => {
  const centerSg = selectedSg.filter(el => el)[0]
  const { nodes, edges } = makeStarFlow(data, centerSg)

  const reactFlowInstance = useReactFlow()
  const nodesInitialized = useNodesInitialized()

  useEffect(() => {
    if (nodesInitialized) {
      setTimeout(() => reactFlowInstance.fitView(), 0)
    }
  }, [reactFlowInstance, nodesInitialized, data, selectedSg, selectedNW, isExtended])

  return (
    <ReactFlow
      proOptions={{ hideAttribution: true }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      onNodeClick={(e, node) => onSelectSg([node.id])}
      onEdgeClick={(e, edge) => {
        onSelectSg([edge.source, edge.target])
      }}
      fitView
    >
      <Controls />
    </ReactFlow>
  )
}
