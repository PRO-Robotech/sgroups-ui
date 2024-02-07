import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import { NetworksList } from 'components'

export const NetworksPage: FC = () => (
  <LeftMenuTemplate>
    <NetworksList />
  </LeftMenuTemplate>
)
