import { TPortGroup } from 'localTypes/rules'

const checkIfPortRangeIncludesPort = (portRange: string, port?: string): boolean => {
  if (port) {
    const [portRangeStart, portRangeEnd] = portRange.split('-')
    if (port >= portRangeStart && port <= portRangeEnd) {
      return true
    }
  }
  return false
}

const mergeTwoRanges = (portRange: string, portRangeSecond: string): string => {
  const [portRangeStartString, portRangeEndString] = portRange.split('-')
  const [portRangeSecondStartString, portRangeSecondEndString] = portRangeSecond.split('-')
  const portRangeStart = Number(portRangeStartString)
  const portRangeEnd = Number(portRangeEndString)
  const portRangeSecondStart = Number(portRangeSecondStartString)
  const portRangeSecondEnd = Number(portRangeSecondEndString)
  // second inside first
  if (portRangeSecondStart >= portRangeStart && portRangeSecondEnd <= portRangeEnd) {
    return `${portRangeStart}-${portRangeEnd}`
  }
  // first inside second
  if (portRangeStart >= portRangeSecondStart && portRangeEnd <= portRangeSecondEnd) {
    return `${portRangeSecondStart}-${portRangeSecondEnd}`
  }
  // overlap
  if (
    portRangeSecondStart >= portRangeStart &&
    portRangeSecondStart < portRangeEnd &&
    portRangeSecondEnd >= portRangeEnd
  ) {
    return `${portRangeStart}-${portRangeSecondEnd}`
  }
  // overlap otherside
  if (
    portRangeSecondEnd >= portRangeStart &&
    portRangeSecondEnd < portRangeEnd &&
    portRangeSecondStart <= portRangeStart
  ) {
    return `${portRangeSecondStart}-${portRangeEnd}`
  }
  // no overlap
  return `${portRangeStart}-${portRangeEnd},${portRangeSecondStart}-${portRangeSecondEnd}`
}

const replacePortInPortsString = (port: string, searchText: string, portsString: string) =>
  portsString.replace(searchText, port)

const addPortInPortsString = (port: string, portsString: string) =>
  portsString.length === 0 ? port : portsString.concat(`,${port}`)

export const mergePorts = (ports: TPortGroup[]): TPortGroup[] => {
  if (ports.length === 0) {
    return []
  }
  const sourceResult: TPortGroup[] = []
  const result: TPortGroup[] = []

  ports
    .map(({ s }) => s)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .forEach(s => {
      const destinationPortsForSourcePort = ports
        .filter(el => el.s === s)
        .map(({ d }) => d)
        .filter((item, index, arr) => arr.indexOf(item) === index)
      // if we have any, we just add {s, any}
      if (destinationPortsForSourcePort.includes(undefined)) {
        sourceResult.push({ s, d: undefined })
      } else {
        let destinationPortsResult = ''
        destinationPortsForSourcePort.forEach(destinationPort => {
          if (destinationPort) {
            const isIncluded = destinationPortsResult.split(',').some(el => {
              if (el.includes('-') && destinationPort.includes('-')) {
                destinationPortsResult = replacePortInPortsString(
                  mergeTwoRanges(el, destinationPort),
                  el,
                  destinationPortsResult,
                )
                return true
              }
              if (
                el.includes('-') &&
                !destinationPort.includes('-') &&
                checkIfPortRangeIncludesPort(el, destinationPort)
              ) {
                return true
              }
              if (
                destinationPort.includes('-') &&
                !el.includes('-') &&
                checkIfPortRangeIncludesPort(destinationPort, el)
              ) {
                destinationPortsResult = replacePortInPortsString(destinationPort, el, destinationPortsResult)
                return true
              }
              if (el === destinationPort) {
                return true
              }
              return false
            })
            if (!isIncluded) {
              destinationPortsResult = addPortInPortsString(destinationPort, destinationPortsResult)
            }
          }
        })
        sourceResult.push({ s, d: destinationPortsResult })
      }
    })

  sourceResult
    .map(({ d }) => d)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .forEach(d => {
      const sourcePortsForDestinationPorts = ports
        .filter(el => el.d === d)
        .map(({ s }) => s)
        .filter((item, index, arr) => arr.indexOf(item) === index)
      // if we have any, we just add {any, d}
      if (sourcePortsForDestinationPorts.includes(undefined)) {
        result.push({ s: undefined, d })
      } else {
        let sourcePortsResult = ''
        sourcePortsForDestinationPorts.forEach(sourcePort => {
          if (sourcePort) {
            const isIncluded = sourcePortsResult.split(',').some(el => {
              if (el.includes('-') && sourcePort.includes('-')) {
                sourcePortsResult = replacePortInPortsString(mergeTwoRanges(el, sourcePort), el, sourcePortsResult)
                return true
              }
              if (el.includes('-') && !sourcePort.includes('-') && checkIfPortRangeIncludesPort(el, sourcePort)) {
                return true
              }
              if (sourcePort.includes('-') && !el.includes('-') && checkIfPortRangeIncludesPort(sourcePort, el)) {
                sourcePortsResult = replacePortInPortsString(sourcePort, el, sourcePortsResult)
                return true
              }
              if (el === sourcePort) {
                return true
              }
              return false
            })
            if (!isIncluded) {
              sourcePortsResult = addPortInPortsString(sourcePort, sourcePortsResult)
            }
          }
        })
        result.push({ s: sourcePortsResult, d })
      }
    })

  return result
}

export const findPortsInPortsArr = (ports: TPortGroup, portsArr: TPortGroup[]): boolean => {
  return portsArr.some(({ s, d }) => s === ports.s && d === ports.d)
}
