export type TSGDefaultAction = 'ACCEPT' | 'DROP'

export type TSecurityGroup = {
  defaultAction: TSGDefaultAction
  logs: boolean
  name: string
  networks: string[]
  trace: boolean
}

export type TSGResponse = {
  groups: TSecurityGroup[]
}
