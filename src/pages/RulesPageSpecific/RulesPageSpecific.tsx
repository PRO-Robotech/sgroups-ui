import React, { FC } from 'react'
import { LeftMenuTemplate } from 'templates'
import {
  RulesListSgSg,
  RulesListSgSgIcmp,
  RulesListSgSgIe,
  RulesListSgSgIeIcmp,
  RulesListSgFqdn,
  RulesListSgCidr,
  RulesListSgCidrIcmp,
} from 'components'

type TRulesPageSpecificProps = {
  id: 'sgSg' | 'sgSgIcmp' | 'sgSgIe' | 'sgSgIeIcmp' | 'sgFqdn' | 'sgCidr' | 'sgCidrIcmp'
}

export const RulesPageSpecific: FC<TRulesPageSpecificProps> = ({ id }) => (
  <LeftMenuTemplate>
    {id === 'sgSg' && <RulesListSgSg />}
    {id === 'sgSgIcmp' && <RulesListSgSgIcmp />}
    {id === 'sgSgIe' && <RulesListSgSgIe />}
    {id === 'sgSgIeIcmp' && <RulesListSgSgIeIcmp />}
    {id === 'sgFqdn' && <RulesListSgFqdn />}
    {id === 'sgCidr' && <RulesListSgCidr />}
    {id === 'sgCidrIcmp' && <RulesListSgCidrIcmp />}
  </LeftMenuTemplate>
)
