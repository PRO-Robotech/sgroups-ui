/* eslint-disable camelcase */
import { Edge, MarkerType } from 'reactflow'
import { TEntry } from 'localTypes/graph'
import type { TConnection } from '../types'

const findIndexOfSgConnectionInArr = (from: string, to: string, arr: TConnection[]): number => {
  return arr.findIndex(el => el.from === from && el.to === to)
}

const makeUniqueSgConnectionArr = (data: TEntry[]): TConnection[] => {
  const uniqueConnections: TConnection[] = []
  const connections: TConnection[] = data.map(({ from, to }) => ({
    from,
    to,
  }))
  connections.forEach(el => {
    const connectionIndex = findIndexOfSgConnectionInArr(el.from, el.to, uniqueConnections)
    if (connectionIndex === -1) {
      uniqueConnections.push(el)
    }
  })
  return uniqueConnections
}

const makeEdges = (data: TEntry[], edgeType: string, cursor = 'initial'): Edge[] => {
  return makeUniqueSgConnectionArr(data).map(({ from, to }) => ({
    id: from + to,
    source: `${from}`,
    target: `${to}`,
    style: { stroke: '#90ee93', cursor },
    selectable: false,
    type: edgeType,
    markerEnd: {
      type: MarkerType.Arrow,
    },
    interactionWidth: 15,
  }))
}

export const makeDefaultEdges = (data: TEntry[]): Edge[] => makeEdges(data, 'default')

export const makeFloatingEdges = (data: TEntry[]): Edge[] => makeEdges(data, 'floating', 'pointer')

export const makeSmartEdges = (data: TEntry[]): Edge[] => makeEdges(data, 'smart', 'pointer')

const findIndexOfPortsConnectionInArr = (source: string, target: string, arr: Edge[]): number => {
  return arr.findIndex(el => el.source === source && el.target === target)
}

export const makePortsEdges = (data: TEntry[]): Edge[] => {
  const connections: Edge[] = []
  data.forEach(({ uuid, from, to, src_port, dst_port }) => {
    const connectionIndex = findIndexOfPortsConnectionInArr(`${from}${src_port}`, `${to}${dst_port}`, connections)
    const statusColor = '#90ee939c'
    if (connectionIndex === -1) {
      connections.push({
        id: uuid,
        source: `${from}${src_port}`,
        target: `${to}${dst_port}`,
        style: { stroke: statusColor },
        type: 'default',
        markerEnd: {
          type: MarkerType.Arrow,
        },
      })
    } else {
      const connectionStyle = connections[connectionIndex].style
      if (connectionStyle && connectionStyle.stroke && connectionStyle.stroke !== statusColor) {
        connectionStyle.stroke = '#eedd909c'
      }
    }
  })
  return connections
}

export const makeLowLevelEdges = (data: TEntry[], isSmart = false): Edge[] => {
  return data.map(({ uuid, from, to, src_ip, src_port, dst_ip, dst_port }) => ({
    id: uuid,
    source: `${from}${src_ip}${src_port}`,
    target: `${to}${dst_ip}${dst_port}`,
    style: { stroke: '#90ee939c' },
    selectable: false,
    type: isSmart ? 'smart' : 'default',
    markerEnd: {
      type: MarkerType.Arrow,
    },
  }))
}
