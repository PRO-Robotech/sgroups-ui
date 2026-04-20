import React, { FC } from 'react'
import { Networks } from 'components/organisms'

type TNetworksPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const NetworksPage: FC<TNetworksPageProps> = ({ cluster, namespace }) => {
  return <Networks cluster={cluster} namespace={namespace} />
}
