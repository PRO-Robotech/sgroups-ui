import React, { FC, Fragment } from 'react'
import { Typography } from 'antd'
import { TitleWithNoTopMargin } from 'components'
import { SGTable, FQDNTable, CidrSgTable } from '../../molecules'
import { TFormSgRuleChangesResult, TFormFqdnRuleChangesResult, TFormCidrSgRuleChangesResult } from '../../types'

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
