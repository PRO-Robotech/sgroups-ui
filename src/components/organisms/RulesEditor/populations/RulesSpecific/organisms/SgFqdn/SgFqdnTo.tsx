import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { GroupRulesNodeWrapper } from '../../../../atoms'
import { RulesBlockFactory } from '../../../../organisms'

export const SgFqdnTo: FC = () => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  return (
    <GroupRulesNodeWrapper $notInTransformBlock>
      <RulesBlockFactory
        title="FQDN To"
        type="sgFqdn"
        popoverPosition="left"
        addpopoverPosition="top"
        subtype="to"
        isDisabled={!centerSg}
        inTransformBlock={false}
      />
    </GroupRulesNodeWrapper>
  )
}
