import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import { RulesListSgSg, RulesListFqdn } from 'components'

type TRulesPageSpecificProps = {
  id: string
}

export const RulesPageSpecific: FC<TRulesPageSpecificProps> = ({ id }) => (
  <LeftMenuTemplate>
    {id === 'SgSg' && <RulesListSgSg />}
    {id === 'Fqdn' && <RulesListFqdn />}
  </LeftMenuTemplate>
)
