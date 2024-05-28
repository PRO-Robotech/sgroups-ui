import { TPortGroup } from 'localTypes/rules'

export const comparePorts = (portsOne: TPortGroup[], portsTwo: TPortGroup[]): boolean => {
  if (portsOne.length !== portsTwo.length) {
    return false
  }
  return portsOne.some(({ s, d }, index) => {
    if (s !== portsTwo[index].s || d !== portsTwo[index].d) {
      return false
    }
    return true
  })
}
