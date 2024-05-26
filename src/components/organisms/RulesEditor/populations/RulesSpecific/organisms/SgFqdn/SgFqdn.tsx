import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgFqdnTo } from 'store/editor/rulesSgFqdn/rulesSgFqdn'
import { GroupRulesNodeWrapper } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgFqdn: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgFqdnTo = useSelector((state: RootState) => state.rulesSgFqdn.rulesTo)

  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory
        title="FQDN To"
        type="sgFqdn"
        popoverPosition="right"
        data={{
          rules: rulesSgFqdnTo,
          setRules: setRulesSgFqdnTo,
        }}
        isDisabled={!centerSg}
        inTransformBlock={false}
      />
    </GroupRulesNodeWrapper>
  )
}
