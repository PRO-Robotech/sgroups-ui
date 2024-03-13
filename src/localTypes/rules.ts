export type TTransport = 'TCP' | 'UDP'

export type TPortGroup = {
  d?: string
  s?: string
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

export type TSgSgIeRule = {
  Sg: string
  SgLocal: string
  logs: boolean
  ports: TPortGroup[]
  trace: boolean
  traffic: TTraffic
  transport: TTransport
}

export type TSgSgIeRulesResponse = {
  rules: TSgSgIeRule[]
}

export type TSgSgIeIcmpRule = {
  Sg: string
  SgLocal: string
  logs: boolean
  trace: boolean
  ICMP: TICMPDescription
  traffic: TTraffic
}

export type TSgSgIeIcmpRulesResponse = {
  rules: TSgSgIeIcmpRule[]
}

export type TFormChangesStatuses = 'modified' | 'deleted' | 'new'

type TFormChanges = {
  status: TFormChangesStatuses
  modifiedFields?: string[]
}

export type TFormSgRule = {
  sg: string
  transport: TTransport
  logs: boolean
  portsDestination?: string
  portsSource?: string
  formChanges?: TFormChanges
}

export type TFormFqdnRule = {
  fqdn: string
  transport: TTransport
  logs: boolean
  portsSource?: string
  portsDestination?: string
  formChanges?: TFormChanges
}

export type TFormCidrSgRule = {
  cidr: string
  transport: TTransport
  logs: boolean
  trace: boolean
  traffic: TTraffic
  portsSource?: string
  portsDestination?: string
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

export type TFormSgSgIeRule = {
  sg: string
  portsSource?: string
  portsDestination?: string
  logs: boolean
  trace: boolean
  traffic: TTraffic
  transport: TTransport
  formChanges?: TFormChanges
}

export type TFormSgSgIeIcmpRule = {
  sg: string
  logs: boolean
  trace: boolean
  IPv: TIpVersion
  types: number[]
  traffic: TTraffic
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

export type TComposedForSubmitSgSgIeRules = {
  rules: TSgSgIeRule[]
  rulesToDelete: TSgSgIeRule[]
}

export type TComposedForSubmitSgSgIeIcmpRules = {
  rules: TSgSgIeIcmpRule[]
  rulesToDelete: TSgSgIeIcmpRule[]
}
