import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import { SecurityGroupAdd } from 'components'

export const SecurityGroupsAddPage: FC = () => (
  <LeftMenuTemplate>
    <SecurityGroupAdd />
  </LeftMenuTemplate>
)
