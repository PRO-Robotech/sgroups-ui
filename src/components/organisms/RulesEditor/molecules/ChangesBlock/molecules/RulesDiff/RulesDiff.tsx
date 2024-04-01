import React, { FC, Dispatch, SetStateAction, useState } from 'react'
import { Typography } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TitleWithNoTopMargin } from 'components'
import {
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TTraffic,
} from 'localTypes/rules'
import { SGTable, FQDNTable, CidrSgTable, SgSgIcmpTable, SgSgIeTable, SgSgIeIcmpTable } from '../../../tables'
import {
  TFormSgRuleChangesResult,
  TFormFqdnRuleChangesResult,
  TFormCidrSgRuleChangesResult,
  TFormSgSgIcmpRuleChangesResult,
  TFormSgSgIeRuleChangesResult,
  TFormSgSgIeIcmpRuleChangesResult,
} from '../../types'

type TRulesDiffProps = {
  title: string
  compareResult:
    | {
        type: 'sg'
        data: TFormSgRuleChangesResult
        sgNames: string[]
        setRules: Dispatch<SetStateAction<TFormSgRule[]>>
        rulesOtherside: TFormSgRule[]
        setRulesOtherside: Dispatch<SetStateAction<TFormSgRule[]>>
        popoverPosition: TooltipPlacement
        centerSg?: string
      }
    | {
        type: 'fqdn'
        data: TFormFqdnRuleChangesResult
        setRules: Dispatch<SetStateAction<TFormFqdnRule[]>>
        popoverPosition: TooltipPlacement
      }
    | {
        type: 'cidr'
        data: TFormCidrSgRuleChangesResult
        defaultTraffic: TTraffic
        setRules: Dispatch<SetStateAction<TFormCidrSgRule[]>>
        popoverPosition: TooltipPlacement
      }
    | {
        type: 'sgSgIcmp'
        data: TFormSgSgIcmpRuleChangesResult
        sgNames: string[]
        popoverPosition: TooltipPlacement
        setRules: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
        rulesOtherside: TFormSgSgIcmpRule[]
        setRulesOtherside: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
        centerSg?: string
      }
    | {
        type: 'sgSgIe'
        data: TFormSgSgIeRuleChangesResult
        sgNames: string[]
        popoverPosition: TooltipPlacement
        defaultTraffic: TTraffic
        setRules: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
      }
    | {
        type: 'sgSgIeIcmp'
        data: TFormSgSgIeIcmpRuleChangesResult
        sgNames: string[]
        popoverPosition: TooltipPlacement
        defaultTraffic: TTraffic
        setRules: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
      }
}

export const RulesDiff: FC<TRulesDiffProps> = ({ title, compareResult }) => {
  const [editOpenNewRules, setEditOpenNewRules] = useState<boolean[]>([])
  const [editOpenModifiedRules, setEditOpenModifiedRules] = useState<boolean[]>([])
  const [editOpenDeletedRules, setEditOpenDeletedRules] = useState<boolean[]>([])

  if (compareResult.type === 'sg') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SGTable rules={compareResult.data.newRules} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SGTable rules={compareResult.data.diffRules} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SGTable rules={compareResult.data.deletedRules} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'fqdn') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <FQDNTable rules={compareResult.data.newRules} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <FQDNTable rules={compareResult.data.diffRules} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <FQDNTable rules={compareResult.data.deletedRules} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'cidr') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <CidrSgTable rules={compareResult.data.newRules} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <CidrSgTable rules={compareResult.data.diffRules} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <CidrSgTable rules={compareResult.data.deletedRules} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'sgSgIcmp') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgSgIcmpTable rules={compareResult.data.newRules} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIcmpTable rules={compareResult.data.diffRules} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIcmpTable rules={compareResult.data.deletedRules} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'sgSgIe') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgSgIeTable rules={compareResult.data.newRules} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIeTable rules={compareResult.data.diffRules} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIeTable rules={compareResult.data.deletedRules} />
          </>
        )}
      </>
    )
  }

  return (
    <>
      <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
      {compareResult.data.newRules.length > 0 && (
        <>
          <Typography.Paragraph>New Rules:</Typography.Paragraph>
          <SgSgIeIcmpTable rules={compareResult.data.newRules} />
        </>
      )}
      {compareResult.data.diffRules.length > 0 && (
        <>
          <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
          <SgSgIeIcmpTable rules={compareResult.data.diffRules} />
        </>
      )}
      {compareResult.data.deletedRules.length > 0 && (
        <>
          <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
          <SgSgIeIcmpTable rules={compareResult.data.deletedRules} />
        </>
      )}
    </>
  )
}
