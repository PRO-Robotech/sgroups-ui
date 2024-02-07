import { TEntry } from 'localTypes/graph'
import type { TNodesEdgesObj } from '../types'
import { makeHighLevelNodes, makeStarNodes, makePortsNodes, makeNetworksNodes, makeLowLevelNodes } from './nodeUtils'
import { makeFloatingEdges, makePortsEdges, makeLowLevelEdges } from './edgeUtils'

export const makeHighLevelFlow = async (data: TEntry[]): Promise<TNodesEdgesObj> => ({
  nodes: await makeHighLevelNodes(data),
  edges: makeFloatingEdges(data),
})

export const makeStarFlow = (data: TEntry[], centerSg: string): TNodesEdgesObj => ({
  nodes: makeStarNodes(data, centerSg),
  edges: makeFloatingEdges(data),
})

export const makePortFlow = (data: TEntry[], groups: string[]): TNodesEdgesObj => ({
  nodes: makePortsNodes(data, groups),
  edges: makePortsEdges(data),
})

export const makeNetworksFlow = (data: TEntry[], groups: string[]): TNodesEdgesObj => ({
  nodes: makeNetworksNodes(data, groups),
  edges: makePortsEdges(data),
})

export const makeLowLevelFlow = (data: TEntry[], groups: string[]): TNodesEdgesObj => ({
  nodes: makeLowLevelNodes(data, groups),
  edges: makeLowLevelEdges(data),
})
