export type TTransport = 'TCP' | 'UDP'

export type TPortGroup = {
  d: string
  s: string
}

export type TTraffic = 'Ingress' | 'Egress'

export type TSgRule = {
  logs: boolean
  ports: TPortGroup[]
  sgFrom: string
  sgTo: string
  transport: TTransport
}

export type TSgRulesResponse = {
  rules: TSgRule[]
}

export type TFqdnRule = {
  FQDN: string
  logs: boolean
  ports: TPortGroup[]
  sgFrom: string
  transport: TTransport
}

export type TFqdnRulesResponse = {
  rules: TFqdnRule[]
}

export type TCidrRule = {
  CIDR: string
  SG: string
  logs: boolean
  ports: TPortGroup[]
  trace: boolean
  traffic: TTraffic
  transport: TTransport
}

export type TCidrRulesResponse = {
  rules: TCidrRule[]
}

export type TIpVersion = 'IPv4' | 'IPv6'

export type TICMPDescription = {
  IPv: TIpVersion
  Types: number[]
}

export type TSgSgIcmpRule = {
  SgFrom: string
  SgTo: string
  logs: boolean
  trace: boolean
  ICMP: TICMPDescription
}

export type TSgSgIcmpRulesResponse = {
  rules: TSgSgIcmpRule[]
}

export type TFormChangesStatuses = 'modified' | 'deleted' | 'new'

type TFormChanges = {
  status: TFormChangesStatuses
  modifiedFields?: string[]
}

export type TFormSgRule = {
  sgs: string[]
  portsSource: string
  portsDestination: string
  transport: TTransport
  logs: boolean
  formChanges?: TFormChanges
}

export type TFormFqdnRule = {
  fqdns: string[]
  portsSource: string
  portsDestination: string
  transport: TTransport
  logs: boolean
  formChanges?: TFormChanges
}

export type TFormCidrSgRule = {
  cidr: string
  portsSource: string
  portsDestination: string
  transport: TTransport
  logs: boolean
  trace: boolean
  traffic: TTraffic
  formChanges?: TFormChanges
}

export type TFormSgSgIcmpRule = {
  sg: string
  logs: boolean
  trace: boolean
  IPv: TIpVersion
  types: number[]
  formChanges?: TFormChanges
}

export type TComposedForSubmitSgRules = {
  rules: TSgRule[]
  rulesToDelete: TSgRule[]
}

export type TComposedForSubmitFqdnRules = {
  rules: TFqdnRule[]
  rulesToDelete: TFqdnRule[]
}

export type TComposedForSubmitCidrRules = {
  rules: TCidrRule[]
  rulesToDelete: TCidrRule[]
}

export type TComposedForSubmitSgSgIcmpRules = {
  rules: TSgSgIcmpRule[]
  rulesToDelete: TSgSgIcmpRule[]
}
