import { TRuleEndpoint, TRuleRow } from '../../tableConfig'

export type TEndpointFormValues = {
  type?: TRuleEndpoint['type']
  namespace?: string
  name?: string
  value?: string
}

export type TTransportEntryFormValue = {
  ports?: string
  types?: string[]
  description?: string
  comment?: string
}

export type TUniRuleFormValues = {
  namespace: string
  name: string
  displayName?: string
  action: 'Allow' | 'Deny'
  traffic?: 'Both' | 'Ingress' | 'Egress'
  description?: string
  comment?: string
  local?: TEndpointFormValues
  remote?: TEndpointFormValues
  transportIPv?: 'IPv4' | 'IPv6'
  transportProtocol?: 'TCP' | 'UDP' | 'ICMP'
  transportEntries?: TTransportEntryFormValue[]
}

export type TUniRuleFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  rule?: TRuleRow | null
  onClose: () => void
}
