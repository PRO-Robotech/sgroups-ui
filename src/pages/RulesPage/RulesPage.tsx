import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import { RulesList } from 'components'

export const RulesPage: FC = () => (
  <LeftMenuTemplate>
    <RulesList />
  </LeftMenuTemplate>
)
