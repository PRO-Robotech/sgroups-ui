export const SGROUPS_API_GROUP = 'sgroups.io'
export const SGROUPS_API_VERSION = 'v1alpha1'

export type TSgroupsResourcePlural = 'addressgroups' | 'hosts' | 'networks' | 'rules' | 'services'

export type TSgroupsResourceDetailsConfig = {
  kind: string
  plural: TSgroupsResourcePlural
  title: string
}

export const SGROUPS_RESOURCE_DETAILS_CONFIG: Record<TSgroupsResourcePlural, TSgroupsResourceDetailsConfig> = {
  addressgroups: {
    kind: 'AddressGroup',
    plural: 'addressgroups',
    title: 'AddressGroup',
  },
  hosts: {
    kind: 'Host',
    plural: 'hosts',
    title: 'Host',
  },
  networks: {
    kind: 'Network',
    plural: 'networks',
    title: 'Network',
  },
  rules: {
    kind: 'Rule',
    plural: 'rules',
    title: 'Rule',
  },
  services: {
    kind: 'Service',
    plural: 'services',
    title: 'Service',
  },
}
