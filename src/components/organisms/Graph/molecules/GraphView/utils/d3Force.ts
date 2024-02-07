import { forceSimulation, forceLink, forceManyBody } from 'd3-force'
import { TUniqueSgWithIndex, TForceDirectedConnection, TForcedDirectedSimulationResult } from '../types'

export const getCoordsByForceDirectedSimulation = async (
  uniqueSgWithIndex: TUniqueSgWithIndex[],
  connections: TForceDirectedConnection[],
): Promise<TForcedDirectedSimulationResult> => {
  let result: TForcedDirectedSimulationResult = []
  let jobDone = false
  const nodes = uniqueSgWithIndex.map(({ index, id }) => ({ index, id, x: undefined, y: undefined }))

  const ticked = () => {
    result = []
    nodes.forEach(({ id, x, y }) => {
      if (id && x && y) {
        result.push({ id, x, y })
      } else {
        throw new Error('Error in sumulation')
      }
    })
  }

  const simulation = forceSimulation(nodes)
    .force('link', forceLink(connections))
    .force('charge', forceManyBody().strength(-50))
    .on('tick', ticked)

  for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    simulation.tick()
    if (i === n - 1) {
      jobDone = true
    }
  }

  return new Promise(resolve => {
    const x = setInterval(() => {
      if (jobDone === true && result.length === nodes.length) {
        clearInterval(x)
        resolve(result)
      }
    }, 500)
  })
}
