export type TNetwork = {
  name: string
  network: {
    CIDR: string
  }
}

export type TNWResponse = {
  networks: TNetwork[]
}

export type TNetworkForm = {
  id: number
  name: string
  CIDR: string
  validateResult: boolean
}
