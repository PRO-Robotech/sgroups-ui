import { TooltipPlacement } from 'antd/es/tooltip'

/* internal types */
export type TRulesTypes = 'sgSg' | 'sgSgIcmp' | 'sgSgIe' | 'sgSgIeIcmp' | 'sgFqdn' | 'sgCidr' | 'sgCidrIcmp'

export type TRulesSubTypes = 'from' | 'to'

export type TRulesTables<T> = {
  direction: TRulesSubTypes
  isChangesMode: boolean
  popoverPosition: TooltipPlacement
  rulesData: T[]
  isDisabled?: boolean
  isRestoreButtonActive?: boolean
  forceArrowsUpdate?: () => void
}

/* common properties */

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

export type TPrioritySome = {
  prioritySome?: number
}

export type TActionType = 'ACCEPT' | 'DROP'

export type TAction = {
  action: TActionType
}

export type TIpVersion = 'IPv4' | 'IPv6'

export type TICMPDescription = {
  IPv: TIpVersion
  Types: number[]
}

/* internal properties for rules */

export type TFormChangesStatuses = 'modified' | 'deleted' | 'new'

export type TFormChanges = {
  status: TFormChangesStatuses
  modifiedFields?: string[]
}

type TCheckStatus = {
  checked?: boolean
}

type TId = {
  id: string
}

/* rules for/from backend */

export type TSgSgRule = {
  sgFrom: string
  sgTo: string
  ports: TPortGroup[]
  logs: boolean
  transport: TTransport
} & TPriority &
  TAction

export type TSgSgRulesResponse = {
  rules: TSgSgRule[]
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
  traffic: TTraffic
  ports: TPortGroup[]
  logs: boolean
  trace: boolean
  transport: TTransport
} & TPriority &
  TAction

export type TSgSgIeRulesResponse = {
  rules: TSgSgIeRule[]
}

export type TSgSgIeIcmpRule = {
  Sg: string
  SgLocal: string
  ICMP: TICMPDescription
  traffic: TTraffic
  logs: boolean
  trace: boolean
} & TPriority &
  TAction

export type TSgSgIeIcmpRulesResponse = {
  rules: TSgSgIeIcmpRule[]
}

export type TSgFqdnRule = {
  sgFrom: string
  FQDN: string
  logs: boolean
  ports: TPortGroup[]
  transport: TTransport
} & TPriority &
  TAction

export type TSgFqdnRulesResponse = {
  rules: TSgFqdnRule[]
}

export type TSgCidrRule = {
  SG: string
  CIDR: string
  traffic: TTraffic
  ports: TPortGroup[]
  logs: boolean
  trace: boolean
  transport: TTransport
} & TPriority &
  TAction

export type TSgCidrRulesResponse = {
  rules: TSgCidrRule[]
}

export type TSgCidrIcmpRule = {
  SG: string
  CIDR: string
  ICMP: TICMPDescription
  traffic: TTraffic
  logs: boolean
  trace: boolean
} & TPriority &
  TAction

export type TSgCidrIcmpRulesResponse = {
  rules: TSgCidrIcmpRule[]
}

/* rules for internal logic */

export type TFormSgSgRuleBase = {
  sg: string
  transport: TTransport
  ports?: TPortGroup[]
  logs: boolean
} & TAction &
  TPrioritySome

export type TFormSgSgRule = TFormSgSgRuleBase & {
  initialValues: TFormSgSgRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

export type TFormSgSgIcmpRuleBase = {
  sg: string
  IPv: TIpVersion
  types: number[]
  logs: boolean
  trace: boolean
} & TAction &
  TPrioritySome

export type TFormSgSgIcmpRule = TFormSgSgIcmpRuleBase & {
  initialValues: TFormSgSgIcmpRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

export type TFormSgSgIeRuleBase = {
  sg: string
  ports?: TPortGroup[]
  transport: TTransport
  traffic: TTraffic
  logs: boolean
  trace: boolean
} & TAction &
  TPrioritySome

export type TFormSgSgIeRule = TFormSgSgIeRuleBase & {
  initialValues: TFormSgSgIeRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

export type TFormSgSgIeIcmpRuleBase = {
  sg: string
  IPv: TIpVersion
  types: number[]
  traffic: TTraffic
  logs: boolean
  trace: boolean
} & TAction &
  TPrioritySome

export type TFormSgSgIeIcmpRule = TFormSgSgIeIcmpRuleBase & {
  initialValues: TFormSgSgIeIcmpRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

export type TFormSgFqdnRuleBase = {
  fqdn: string
  ports?: TPortGroup[]
  transport: TTransport
  logs: boolean
} & TAction &
  TPrioritySome

export type TFormSgFqdnRule = TFormSgFqdnRuleBase & {
  initialValues: TFormSgFqdnRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

export type TFormSgCidrRuleBase = {
  cidr: string
  ports?: TPortGroup[]
  transport: TTransport
  traffic: TTraffic
  logs: boolean
  trace: boolean
} & TAction &
  TPrioritySome

export type TFormSgCidrRule = TFormSgCidrRuleBase & {
  initialValues: TFormSgCidrRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

export type TFormSgCidrIcmpRuleBase = {
  cidr: string
  IPv: TIpVersion
  types: number[]
  traffic: TTraffic
  logs: boolean
  trace: boolean
} & TAction &
  TPrioritySome

export type TFormSgCidrIcmpRule = TFormSgCidrIcmpRuleBase & {
  initialValues: TFormSgCidrIcmpRuleBase
  formChanges?: TFormChanges
} & TCheckStatus &
  TId

/* rules to submit */

export type TComposedForSubmitRules<T> = {
  rules: T[]
  rulesToDelete: T[]
}
