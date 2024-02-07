export type TNetwork = {
  name: string
  network: {
    CIDR: string
  }
}

export type TNWResponse = {
  networks: TNetwork[]
}
