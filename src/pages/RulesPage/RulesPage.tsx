import React, { FC } from 'react'
import { Rules } from 'components/organisms'

type TRulesPageProps = {
  cluster?: string
  namespace?: string
  syntheticProject?: string
  pluginName?: string
  pluginPath?: string
  toggleTheme?: () => void
}

export const RulesPage: FC<TRulesPageProps> = ({ cluster, namespace }) => {
  return <Rules cluster={cluster} namespace={namespace} />
}
