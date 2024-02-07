import React, { FC, useEffect } from 'react'
import ReactFlow, { useReactFlow, useNodesInitialized, Controls } from 'reactflow'
import 'reactflow/dist/style.css'
import { TEntry } from 'localTypes/graph'
import { nodeTypes, edgeTypes } from '../../helpers'
import { makePortFlow } from '../../utils'
import { Styled } from '../../styled'

type TPortsFlowPorts = {
  data: TEntry[]
  selectedSg: string[]
  onSelectPort: (port: string) => void
  isExtended: boolean
  selectedNW?: string
}

export const PortsFlow: FC<TPortsFlowPorts> = ({ data, selectedSg, onSelectPort, selectedNW, isExtended }) => {
  const { nodes, edges } = makePortFlow(data, selectedSg)

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
        onNodeClick={(e, node) => {
          if (node.type === 'protocolNodeLeft' || node.type === 'protocolNodeRight') {
            onSelectPort(node.data.label)
          }
        }}
        fitView
      >
        <Controls />
      </ReactFlow>
    </Styled.DefaultCursorEdges>
  )
}
