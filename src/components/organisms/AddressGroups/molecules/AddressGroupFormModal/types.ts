import { ReactNode } from 'react'
import { TAddressGroupResource } from 'components/organisms/AddressGroups/tableConfig'
import { THostBindingResource, TNetworkBindingResource, TServiceBindingResource } from 'localTypes'

export type TAddressGroupFormModalProps = {
  cluster: string
  namespace?: string
  open: boolean
  addressGroup?: TAddressGroupResource | null
  onClose: () => void
}

export type TAddressGroupFormValues = {
  namespace: string
  name: string
  displayName?: string
  allowAccess?: boolean
  hosts?: string[]
  services?: string[]
  networks?: string[]
  description?: string
  comment?: string
}

export type TSelectableResource = {
  metadata: {
    name?: string
    namespace?: string
  }
  spec?: {
    displayName?: string
  }
}

export type TResourceOption = {
  value: string
  label: ReactNode
  searchText: string
}

export type TCurrentBindings = {
  hosts: THostBindingResource[]
  services: TServiceBindingResource[]
  networks: TNetworkBindingResource[]
}
