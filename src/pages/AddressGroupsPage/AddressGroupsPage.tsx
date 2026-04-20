import React, { FC } from 'react'
import { AddressGroups } from 'components/organisms'

type TAddressGroupsPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const AddressGroupsPage: FC<TAddressGroupsPageProps> = ({ cluster, namespace }) => {
  return <AddressGroups cluster={cluster} namespace={namespace} />
}
