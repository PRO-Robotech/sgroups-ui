export type TNetwork = {
  name: string
  network: {
    CIDR: string
  }
}

export type TNwResponse = {
  networks: TNetwork[]
}

export type TNetworkForm = {
  name: string
  CIDR: string
}

export type TNetworkWithSg = TNetwork & {
  securityGroup?: string
}

export type TNetworkFormWithSg = TNetworkForm & {
  securityGroup?: string
}
