import React, { FC } from 'react'
import { RULES_CONFIGS_FOR_FACTORY } from '../../constants'
import { RulesBlockFactory } from '../../organisms'
import { Styled } from './styled'

type TRulesByTypeProps = {
  typeId: string
  subType: string
}

export const RulesByType: FC<TRulesByTypeProps> = ({ typeId, subType }) => {
  return (
    <>
      {typeId === 'sgSg' && subType === 'TCP/UDP' && (
        <Styled.Container>
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSg.from} isDisabledDefault />
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSg.to} isDisabledDefault />
        </Styled.Container>
      )}
      {typeId === 'sgSg' && subType === 'ICMP' && (
        <Styled.Container>
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIcmp.from} />
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIcmp.to} />
        </Styled.Container>
      )}
      {typeId === 'sgSgIe' && subType === 'TCP/UDP' && (
        <Styled.Container>
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIe.from} />
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIe.to} />
        </Styled.Container>
      )}
      {typeId === 'sgSgIe' && subType === 'ICMP' && (
        <Styled.Container>
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIeIcmp.from} />
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgSgIeIcmp.to} />
        </Styled.Container>
      )}
      {typeId === 'sgCidr' && subType === 'TCP/UDP' && (
        <Styled.Container>
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidr.from} />
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidr.to} />
        </Styled.Container>
      )}
      {typeId === 'sgCidr' && subType === 'ICMP' && (
        <Styled.Container>
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidrIcmp.from} />
          <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgCidrIcmp.to} />
        </Styled.Container>
      )}
      {typeId === 'sgFqdn' && <RulesBlockFactory {...RULES_CONFIGS_FOR_FACTORY.sgFqdn.to} />}
    </>
  )
}
