import { TPortGroup } from 'localTypes/rules'

export const comparePorts = (portsOne?: TPortGroup[] | null, portsTwo?: TPortGroup[] | null): boolean => {
  if (portsOne && portsTwo) {
    if (portsOne.length !== portsTwo.length) {
      return false
    }
    return !portsOne.some(({ s, d }, index) => {
      if (s !== portsTwo[index].s || d !== portsTwo[index].d) {
        return true
      }
      return false
    })
  }
  if ((portsOne && portsOne.length === 0 && !portsTwo) || (portsTwo && portsTwo.length === 0 && !portsOne)) {
    return true
  }
  if ((portsOne && !portsTwo) || (!portsOne && portsTwo)) {
    return false
  }
  return false
}
