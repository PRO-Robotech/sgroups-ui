import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import {
  RulesListSgSg,
  RulesListFqdn,
  RulesListCidr,
  RulesListCidrSgIcmp,
  RulesListSgSgIcmp,
  RulesListSgSgIe,
  RulesListSgSgIeIcmp,
} from 'components'

type TRulesPageSpecificProps = {
  id: 'sgSg' | 'fqdn' | 'cidr' | 'cidrIcmp' | 'sgSgIcmp' | 'sgSgIe' | 'sgSgIeIcmp'
}

export const RulesPageSpecific: FC<TRulesPageSpecificProps> = ({ id }) => (
  <LeftMenuTemplate>
    {id === 'sgSg' && <RulesListSgSg />}
    {id === 'sgSgIcmp' && <RulesListSgSgIcmp />}
    {id === 'cidr' && <RulesListCidr />}
    {id === 'cidrIcmp' && <RulesListCidrSgIcmp />}
    {id === 'sgSgIe' && <RulesListSgSgIe />}
    {id === 'sgSgIeIcmp' && <RulesListSgSgIeIcmp />}
    {id === 'fqdn' && <RulesListFqdn />}
  </LeftMenuTemplate>
)
