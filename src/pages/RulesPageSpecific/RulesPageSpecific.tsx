import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import {
  RulesListSgSg,
  RulesListFqdn,
  RulesListCidr,
  RulesListSgSgIcmp,
  RulesListSgSgIe,
  RulesListSgSgIeIcmp,
} from 'components'

type TRulesPageSpecificProps = {
  id: 'sgSg' | 'fqdn' | 'cidr' | 'sgSgIcmp' | 'sgSgIe' | 'sgSgIeIcmp'
}

export const RulesPageSpecific: FC<TRulesPageSpecificProps> = ({ id }) => (
  <LeftMenuTemplate>
    {id === 'sgSg' && <RulesListSgSg />}
    {id === 'fqdn' && <RulesListFqdn />}
    {id === 'cidr' && <RulesListCidr />}
    {id === 'sgSgIcmp' && <RulesListSgSgIcmp />}
    {id === 'sgSgIe' && <RulesListSgSgIe />}
    {id === 'sgSgIeIcmp' && <RulesListSgSgIeIcmp />}
  </LeftMenuTemplate>
)
