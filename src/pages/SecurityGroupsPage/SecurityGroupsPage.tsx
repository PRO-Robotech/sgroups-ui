import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import { SecurityGroupsList } from 'components'

export const SecurityGroupsPage: FC = () => (
  <LeftMenuTemplate>
    <SecurityGroupsList />
  </LeftMenuTemplate>
)
