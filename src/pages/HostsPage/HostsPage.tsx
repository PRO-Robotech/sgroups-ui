import React, { FC } from 'react'
import { Greeting } from 'components'

type THostsPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const HostsPage: FC<THostsPageProps> = props => {
  return <Greeting {...props} />
}
