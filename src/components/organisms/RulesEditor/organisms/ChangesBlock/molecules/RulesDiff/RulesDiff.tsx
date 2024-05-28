/* eslint-disable max-lines-per-function */
import React, { FC } from 'react'
import { Typography } from 'antd'
import { TitleWithNoTopMargin } from 'components'
import {
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
  TRulesSubTypes,
} from 'localTypes/rules'
import { TooltipPlacement } from 'antd/es/tooltip'
import {
  SgSgTable,
  SgSgIcmpTable,
  SgSgIeTable,
  SgSgIeIcmpTable,
  SgFqdnTable,
  SgCidrTable,
  SgCidrIcmpTable,
} from '../../../../molecules/RulesTables'

type TFormRuleChangesResult<T> = { newRules: T[]; diffRules: T[]; deletedRules: T[] }

type TRulesDiffProps = {
  title: string
  direction: TRulesSubTypes
  compareResult:
    | {
        type: 'sgSg'
        data: TFormRuleChangesResult<TFormSgSgRule>
      }
    | {
        type: 'sgSgIcmp'
        data: TFormRuleChangesResult<TFormSgSgIcmpRule>
      }
    | {
        type: 'sgSgIe'
        data: TFormRuleChangesResult<TFormSgSgIeRule>
      }
    | {
        type: 'sgSgIeIcmp'
        data: TFormRuleChangesResult<TFormSgSgIeIcmpRule>
      }
    | {
        type: 'sgFqdn'
        data: TFormRuleChangesResult<TFormSgFqdnRule>
      }
    | {
        type: 'sgCidr'
        data: TFormRuleChangesResult<TFormSgCidrRule>
      }
    | {
        type: 'sgCidrIcmp'
        data: TFormRuleChangesResult<TFormSgCidrIcmpRule>
      }
}

export const RulesDiff: FC<TRulesDiffProps> = ({ title, direction, compareResult }) => {
  const defaultProps: { direction: TRulesSubTypes; isChangesMode: boolean; popoverPosition: TooltipPlacement } = {
    direction,
    isChangesMode: true,
    popoverPosition: 'right',
  }
  const defaultPropsDeleted: {
    direction: TRulesSubTypes
    isChangesMode: boolean
    popoverPosition: TooltipPlacement
    isRestoreButtonActive: boolean
  } = {
    ...defaultProps,
    isRestoreButtonActive: true,
  }

  if (compareResult.type === 'sgSg') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgSgTable rulesData={compareResult.data.newRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgTable rulesData={compareResult.data.diffRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
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
            <SgSgIcmpTable rulesData={compareResult.data.newRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIcmpTable rulesData={compareResult.data.diffRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIcmpTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
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
            <SgSgIeTable rulesData={compareResult.data.newRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIeTable rulesData={compareResult.data.diffRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIeTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'sgSgIeIcmp') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgSgIeIcmpTable rulesData={compareResult.data.newRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIeIcmpTable rulesData={compareResult.data.diffRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIeIcmpTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'sgFqdn') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgFqdnTable rulesData={compareResult.data.newRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgFqdnTable rulesData={compareResult.data.diffRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgFqdnTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
          </>
        )}
      </>
    )
  }

  if (compareResult.type === 'sgCidr') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgCidrTable rulesData={compareResult.data.newRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgCidrTable rulesData={compareResult.data.diffRules} {...defaultProps} />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgCidrTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
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
          <SgCidrIcmpTable rulesData={compareResult.data.newRules} {...defaultProps} />
        </>
      )}
      {compareResult.data.diffRules.length > 0 && (
        <>
          <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
          <SgCidrIcmpTable rulesData={compareResult.data.diffRules} {...defaultProps} />
        </>
      )}
      {compareResult.data.deletedRules.length > 0 && (
        <>
          <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
          <SgCidrIcmpTable rulesData={compareResult.data.deletedRules} {...defaultPropsDeleted} />
        </>
      )}
    </>
  )
}
