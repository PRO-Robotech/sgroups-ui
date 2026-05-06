import { THostRow } from '../../tableConfig'

export type THostFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  host?: THostRow | null
  onClose: () => void
}

export type THostFormValues = {
  namespace: string
  name: string
  displayName?: string
  addressGroupNamespace?: string
  addressGroups?: string[]
  description?: string
  comment?: string
}
