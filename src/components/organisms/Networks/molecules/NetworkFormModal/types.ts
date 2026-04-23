import { TNetworkRow } from '../../tableConfig'

export type TNetworkFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  network?: TNetworkRow | null
  onClose: () => void
}

export type TNetworkFormValues = {
  namespace: string
  name: string
  displayName?: string
  addressGroups?: string[]
  cidr: string
  description?: string
  comment?: string
}
