import React, { FC, Fragment } from 'react'
import { Typography } from 'antd'
import { TitleWithNoTopMargin } from 'components'
import { SGTable, FQDNTable, CidrSgTable, SgSgIcmpTable, SgSgIeTable, SgSgIeIcmpTable } from '../../molecules'
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
      }
    | {
        type: 'fqdn'
        data: TFormFqdnRuleChangesResult
      }
    | {
        type: 'cidr'
        data: TFormCidrSgRuleChangesResult
      }
    | {
        type: 'sgSgIcmp'
        data: TFormSgSgIcmpRuleChangesResult
      }
    | {
        type: 'sgSgIe'
        data: TFormSgSgIeRuleChangesResult
      }
    | {
        type: 'sgSgIeIcmp'
        data: TFormSgSgIeIcmpRuleChangesResult
      }
}

export const RulesDiff: FC<TRulesDiffProps> = ({ title, compareResult }) => {
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
