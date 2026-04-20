export type { TAddressGroupResource } from 'components/organisms/AddressGroups/tableConfig'
export type { THostResource } from 'components/organisms/Hosts/tableConfig'
export type { TNetworkResource } from 'components/organisms/Networks/tableConfig'
export type {
  TServiceResource,
  TServiceTransport,
  TServiceTransportEntry,
} from 'components/organisms/Services/tableConfig'

export type TResourceIdentifier = {
  name?: string
  namespace?: string
}

export type TBindingBase = {
  metadata: {
    name?: string
    namespace?: string
  }
  spec?: {
    addressGroup?: TResourceIdentifier
    displayName?: string
    description?: string
    comment?: string
  }
}

export type THostBindingResource = TBindingBase & {
  spec?: TBindingBase['spec'] & {
    host?: TResourceIdentifier
  }
}

export type TNetworkBindingResource = TBindingBase & {
  spec?: TBindingBase['spec'] & {
    network?: TResourceIdentifier
  }
}

export type TServiceBindingResource = TBindingBase & {
  spec?: TBindingBase['spec'] & {
    service?: TResourceIdentifier
  }
}
