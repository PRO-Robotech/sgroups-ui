import React, { FC, useEffect, useState } from 'react'
import { Spin } from 'antd'
import { Node, Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import { TEntry } from 'localTypes/graph'
import { makeHighLevelFlow } from '../../utils'
import { Flow } from './molecules'

type THighLevelFlowProps = {
  data: TEntry[]
  selectedSg: string[]
  onSelectSg: (values: string[]) => void
  isExtended: boolean
  selectedNW?: string
}

export const HighLevelFlow: FC<THighLevelFlowProps> = ({ data, selectedSg, onSelectSg, selectedNW, isExtended }) => {
  const [nodes, setNodes] = useState<Node[]>()
  const [edges, setEdges] = useState<Edge[]>()

  useEffect(() => {
    makeHighLevelFlow(data).then(({ nodes, edges }) => {
      setNodes(nodes)
      setEdges(edges)
    })
  }, [data])

  if (!nodes || !edges) {
    return <Spin />
  }

  return (
    <Flow
      nodes={nodes}
      edges={edges}
      selectedSg={selectedSg}
      onSelectSg={onSelectSg}
      selectedNW={selectedNW}
      isExtended={isExtended}
    />
  )
}
