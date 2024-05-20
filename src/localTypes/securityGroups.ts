export type TSgDefaultAction = 'ACCEPT' | 'DROP'

export type TSecurityGroup = {
  defaultAction: TSgDefaultAction
  logs: boolean
  name: string
  networks: string[]
  trace: boolean
}

export type TSgResponse = {
  groups: TSecurityGroup[]
}
