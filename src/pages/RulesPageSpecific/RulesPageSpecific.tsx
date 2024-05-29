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
import { TRulesTypes } from 'localTypes/rules'

type TRulesPageSpecificProps = {
  id: TRulesTypes
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
