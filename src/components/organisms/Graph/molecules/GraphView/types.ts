import { CSSProperties } from 'react'
import { Node, Edge } from 'reactflow'

export type TSimpleFloatingEdge = {
  id: string
  source: string
  target: string
  markerEnd?: string
  style?: CSSProperties
}

export type TSgAndHandlerTypes = {
  group: string
  type: string
}

export type TForceDirectedConnection = {
  source: number
  target: number
}

export type TUniqueSgWithIndex = {
  index: number
  id: string
}

export type TForcedDirectedSimulationResult = {
  id: string
  x: number
  y: number
}[]

export type TSGTypePort = {
  [key: string]: {
    src: string[]
    dst: string[]
  }
}

export type TSGsAndNetworks = {
  [key: string]: string[]
}

export type TIpPortType = {
  ip: string
  port: string
}

export type TSgAndIpPortType = {
  [key: string]: {
    src: TIpPortType[]
    dst: TIpPortType[]
  }
}

export type TConnection = {
  from: string
  to: string
}

export type TNodesEdgesObj = {
  nodes: Node[]
  edges: Edge[]
}
