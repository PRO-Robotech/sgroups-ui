import React, { FC } from 'react'
import { Services } from 'components/organisms'

type TServicesPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const ServicesPage: FC<TServicesPageProps> = ({ cluster, namespace }) => {
  return <Services cluster={cluster} namespace={namespace} />
}
