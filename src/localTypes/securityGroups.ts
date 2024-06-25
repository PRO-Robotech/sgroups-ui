export type TSgDefaultAction = 'ACCEPT' | 'DROP'

export type TSecurityGroup = {
  name: string
  networks: string[]
  defaultAction: TSgDefaultAction
  logs: boolean
  trace: boolean
}

export type TSgResponse = {
  groups: TSecurityGroup[]
}
