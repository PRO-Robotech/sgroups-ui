import React, { FC, useEffect } from 'react'
import ReactFlow, { Node, Edge, useReactFlow, useNodesInitialized, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import { nodeTypes, edgeTypes } from '../../../../helpers'

type TFlowProps = {
  nodes: Node[]
  edges: Edge[]
  selectedSg: string[]
  onSelectSg: (values: string[]) => void
  isExtended: boolean
  selectedNW?: string
}

export const Flow: FC<TFlowProps> = ({ nodes, edges, selectedSg, onSelectSg, selectedNW, isExtended }) => {
  const reactFlowInstance = useReactFlow()
  const nodesInitialized = useNodesInitialized()

  useEffect(() => {
    if (nodesInitialized) {
      setTimeout(() => reactFlowInstance.fitView(), 0)
    }
  }, [reactFlowInstance, nodesInitialized, nodes, edges, selectedSg, selectedNW, isExtended])

  if (!nodes || !edges) {
    return null
  }

  return (
    <ReactFlow
      proOptions={{ hideAttribution: true }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      onNodeClick={(e, node) => {
        onSelectSg([node.id])
      }}
      onEdgeClick={(e, edge) => {
        onSelectSg([edge.source, edge.target])
      }}
      fitView
    >
      <Controls />
    </ReactFlow>
  )
}
