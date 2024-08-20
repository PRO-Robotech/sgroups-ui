/* eslint-disable max-lines-per-function */
import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import {
  SgSgTable,
  SgSgIcmpTable,
  SgSgIeTable,
  SgSgIeIcmpTable,
  SgFqdnTable,
  SgCidrTable,
  SgCidrIcmpTable,
} from '../../../../molecules/RulesTables'
import { RulesBlock } from '../../atoms'

type TRulesDiffProps = {
  title: string
  type: string
}

export const RulesDiff: FC<TRulesDiffProps> = ({ title, type }) => {
  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)
  const rulesSgSgIeFrom = useSelector((state: RootState) => state.rulesSgSgIe.rulesFrom)
  const rulesSgSgIeTo = useSelector((state: RootState) => state.rulesSgSgIe.rulesTo)
  const rulesSgSgIeIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesFrom)
  const rulesSgSgIeIcmpTo = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesTo)
  const rulesSgFqdnTo = useSelector((state: RootState) => state.rulesSgFqdn.rulesTo)
  const rulesSgCidrFrom = useSelector((state: RootState) => state.rulesSgCidr.rulesFrom)
  const rulesSgCidrTo = useSelector((state: RootState) => state.rulesSgCidr.rulesTo)
  const rulesSgCidrIcmpFrom = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesFrom)
  const rulesSgCidrIcmpTo = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesTo)

  const rulesSgSgFromWithChanges = rulesSgSgFrom.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgToWithChanges = rulesSgSgTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgIcmpFromWithChanges = rulesSgSgIcmpFrom.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgIcmpToWithChanges = rulesSgSgIcmpTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgIeFromWithChanges = rulesSgSgIeFrom.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgIeToWithChanges = rulesSgSgIeTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgIeIcmpFromWithChanges = rulesSgSgIeIcmpFrom.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgSgIeIcmpToWithChanges = rulesSgSgIeIcmpTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgFqdnToWithChanges = rulesSgFqdnTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgCidrFromWithChanges = rulesSgCidrFrom.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgCidrToWithChanges = rulesSgCidrTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgCidrIcmpFromWithChanges = rulesSgCidrIcmpFrom.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )
  const rulesSgCidrIcmpToWithChanges = rulesSgCidrIcmpTo.filter(
    ({ formChanges }) =>
      formChanges?.status === 'new' ||
      formChanges?.status === 'deleted' ||
      (formChanges?.status === 'modified' && formChanges.modifiedFields && formChanges.modifiedFields?.length > 0),
  )

  const sgSgCount = rulesSgSgFromWithChanges.length + rulesSgSgToWithChanges.length
  const sgSgIcmpCount = rulesSgSgIcmpFromWithChanges.length + rulesSgSgIcmpToWithChanges.length
  const sgSgIeCount = rulesSgSgIeFromWithChanges.length + rulesSgSgIeToWithChanges.length
  const sgSgIeIcmpCount = rulesSgSgIeIcmpFromWithChanges.length + rulesSgSgIeIcmpToWithChanges.length
  const sgFqdnCount = rulesSgFqdnToWithChanges.length
  const sgCidrCount = rulesSgCidrFromWithChanges.length + rulesSgCidrToWithChanges.length
  const sgCidrIcmpCount = rulesSgCidrIcmpFromWithChanges.length + rulesSgCidrIcmpToWithChanges.length

  if (type === 'sgSg' && sgSgCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgSgCount}
        tableFrom={
          rulesSgSgFromWithChanges.length > 0 ? (
            <SgSgTable direction="from" rulesData={rulesSgSgFromWithChanges} isChangesMode isDisabled />
          ) : undefined
        }
        tableTo={
          rulesSgSgToWithChanges.length > 0 ? (
            <SgSgTable direction="to" rulesData={rulesSgSgToWithChanges} isChangesMode isDisabled />
          ) : undefined
        }
      />
    )
  }
  if (type === 'sgSgIcmp' && sgSgIcmpCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgSgIcmpCount}
        tableFrom={
          rulesSgSgIcmpFromWithChanges.length > 0 ? (
            <SgSgIcmpTable direction="from" rulesData={rulesSgSgIcmpFromWithChanges} isChangesMode isDisabled />
          ) : undefined
        }
        tableTo={
          rulesSgSgIcmpToWithChanges.length > 0 ? (
            <SgSgIcmpTable direction="to" rulesData={rulesSgSgIcmpToWithChanges} isChangesMode isDisabled />
          ) : undefined
        }
      />
    )
  }
  if (type === 'sgSgIe' && sgSgIeCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgSgIeCount}
        tableFrom={
          rulesSgSgIeFromWithChanges.length > 0 ? (
            <SgSgIeTable direction="from" rulesData={rulesSgSgIeFromWithChanges} isChangesMode />
          ) : undefined
        }
        tableTo={
          rulesSgSgIeToWithChanges.length > 0 ? (
            <SgSgIeTable direction="to" rulesData={rulesSgSgIeToWithChanges} isChangesMode />
          ) : undefined
        }
      />
    )
  }
  if (type === 'sgSgIeIcmp' && sgSgIeIcmpCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgSgIeIcmpCount}
        tableFrom={
          rulesSgSgIeIcmpFromWithChanges.length > 0 ? (
            <SgSgIeIcmpTable direction="from" rulesData={rulesSgSgIeIcmpFromWithChanges} isChangesMode />
          ) : undefined
        }
        tableTo={
          rulesSgSgIeIcmpToWithChanges.length > 0 ? (
            <SgSgIeIcmpTable direction="to" rulesData={rulesSgSgIeIcmpToWithChanges} isChangesMode />
          ) : undefined
        }
      />
    )
  }
  if (type === 'sgFqdn' && sgFqdnCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgFqdnCount}
        tableTo={
          rulesSgFqdnToWithChanges.length > 0 ? (
            <SgFqdnTable direction="to" rulesData={rulesSgFqdnToWithChanges} isChangesMode />
          ) : undefined
        }
      />
    )
  }
  if (type === 'sgCidr' && sgCidrCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgCidrCount}
        tableFrom={
          rulesSgCidrFromWithChanges.length > 0 ? (
            <SgCidrTable direction="from" rulesData={rulesSgCidrFromWithChanges} isChangesMode />
          ) : undefined
        }
        tableTo={
          rulesSgCidrToWithChanges.length > 0 ? (
            <SgCidrTable direction="to" rulesData={rulesSgCidrToWithChanges} isChangesMode />
          ) : undefined
        }
      />
    )
  }

  if (type === 'sgCidrIcmp' && sgCidrIcmpCount > 0) {
    return (
      <RulesBlock
        title={title}
        count={sgCidrIcmpCount}
        tableFrom={
          rulesSgSgFromWithChanges.length > 0 ? (
            <SgCidrIcmpTable direction="from" rulesData={rulesSgCidrIcmpFromWithChanges} isChangesMode />
          ) : undefined
        }
        tableTo={
          rulesSgSgFromWithChanges.length > 0 ? (
            <SgCidrIcmpTable direction="to" rulesData={rulesSgCidrIcmpToWithChanges} isChangesMode />
          ) : undefined
        }
      />
    )
  }

  return null
}
