import React, { FC } from 'react'
import { Hosts } from 'components/organisms'

type THostsPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const HostsPage: FC<THostsPageProps> = ({ cluster, namespace }) => {
  return <Hosts cluster={cluster} namespace={namespace} />
}
