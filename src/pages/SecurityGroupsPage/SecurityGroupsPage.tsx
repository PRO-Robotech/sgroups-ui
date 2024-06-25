import React, { FC } from 'react'
import { BaseTemplate } from 'templates'
import { SecurityGroupsList } from 'components'

export const SecurityGroupsPage: FC = () => (
  <BaseTemplate>
    <SecurityGroupsList />
  </BaseTemplate>
)
