import { TServiceRow } from '../../tableConfig'
import { TServiceFormTransportEntry } from './transportUtils'

export type TServiceFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  service?: TServiceRow | null
  onClose: () => void
}

export type TServiceFormValues = {
  namespace: string
  name: string
  displayName?: string
  addressGroups?: string[]
  description?: string
  comment?: string
  transportEntries?: TServiceFormTransportEntry[]
}
