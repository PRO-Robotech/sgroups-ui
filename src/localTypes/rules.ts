export type TTransport = 'TCP' | 'UDP'

export type TPortGroup = {
  d?: string
  s?: string
}

export type TTraffic = 'Ingress' | 'Egress'

export type TPriority = {
  priority?: {
    some?: number
  }
}

export type TActionType = 'ACCEPT' | 'DROP'

export type TAction = {
  action: TActionType
}

export type TSgRule = {
  logs: boolean
  ports: TPortGroup[]
  sgFrom: string
  sgTo: string
  transport: TTransport
} & TPriority &
  TAction

export type TSgRulesResponse = {
  rules: TSgRule[]
}

export type TFqdnRule = {
  FQDN: string
  logs: boolean
  ports: TPortGroup[]
  sgFrom: string
  transport: TTransport
} & TPriority &
  TAction

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
} & TPriority &
  TAction

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
} & TPriority &
  TAction

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
} & TPriority &
  TAction

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
} & TPriority &
  TAction

export type TSgSgIeIcmpRulesResponse = {
  rules: TSgSgIeIcmpRule[]
}

export type TCidrSgIcmpRule = {
  SG: string
  CIDR: string
  logs: boolean
  trace: boolean
  ICMP: TICMPDescription
  traffic: TTraffic
} & TPriority &
  TAction

export type TCidrSgIcmpRulesResponse = {
  rules: TCidrSgIcmpRule[]
}

export type TFormChangesStatuses = 'modified' | 'deleted' | 'new'

type TFormChanges = {
  status: TFormChangesStatuses
  modifiedFields?: string[]
}

type TCheckStatus = {
  checked?: boolean
}

export type TFormSgRule = {
  sg: string
  transport: TTransport
  logs: boolean
  action: TActionType
  portsDestination?: string
  portsSource?: string
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

export type TFormFqdnRule = {
  fqdn: string
  transport: TTransport
  logs: boolean
  action: TActionType
  portsSource?: string
  portsDestination?: string
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

export type TFormCidrSgRule = {
  cidr: string
  transport: TTransport
  logs: boolean
  trace: boolean
  traffic: TTraffic
  action: TActionType
  portsSource?: string
  portsDestination?: string
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

export type TFormSgSgIcmpRule = {
  sg: string
  logs: boolean
  trace: boolean
  IPv: TIpVersion
  types: number[]
  action: TActionType
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

export type TFormSgSgIeRule = {
  sg: string
  portsSource?: string
  portsDestination?: string
  logs: boolean
  trace: boolean
  traffic: TTraffic
  transport: TTransport
  action: TActionType
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

export type TFormSgSgIeIcmpRule = {
  sg: string
  logs: boolean
  trace: boolean
  IPv: TIpVersion
  types: number[]
  traffic: TTraffic
  action: TActionType
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

export type TFormCidrSgIcmpRule = {
  cidr: string
  logs: boolean
  trace: boolean
  IPv: TIpVersion
  types: number[]
  traffic: TTraffic
  action: TActionType
  prioritySome?: number
  formChanges?: TFormChanges
} & TCheckStatus

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

export type TComposedForSubmitCidrSgIcmpRules = {
  rules: TCidrSgIcmpRule[]
  rulesToDelete: TCidrSgIcmpRule[]
}
