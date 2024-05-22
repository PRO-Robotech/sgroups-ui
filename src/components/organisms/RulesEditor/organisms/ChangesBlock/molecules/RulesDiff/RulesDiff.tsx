/* eslint-disable max-lines-per-function */
import React, { FC, useState } from 'react'
import { Typography } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { TitleWithNoTopMargin } from 'components'
import {
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
  TTraffic,
} from 'localTypes/rules'
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
  compareResult:
    | {
        type: 'sgSg'
        data: TFormRuleChangesResult<TFormSgSgRule>
        rules: TFormSgSgRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgRule[]>
        rulesOtherside: TFormSgSgRule[]
        setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>
        popoverPosition: TooltipPlacement
        centerSg?: string
      }
    | {
        type: 'sgSgIcmp'
        data: TFormRuleChangesResult<TFormSgSgIcmpRule>
        popoverPosition: TooltipPlacement
        rules: TFormSgSgIcmpRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
        rulesOtherside: TFormSgSgIcmpRule[]
        setRulesOtherside: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
        centerSg?: string
      }
    | {
        type: 'sgSgIe'
        data: TFormRuleChangesResult<TFormSgSgIeRule>
        popoverPosition: TooltipPlacement
        defaultTraffic: TTraffic
        rules: TFormSgSgIeRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>
      }
    | {
        type: 'sgSgIeIcmp'
        data: TFormRuleChangesResult<TFormSgSgIeIcmpRule>
        popoverPosition: TooltipPlacement
        defaultTraffic: TTraffic
        rules: TFormSgSgIeIcmpRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>
      }
    | {
        type: 'sgFqdn'
        data: TFormRuleChangesResult<TFormSgFqdnRule>
        rules: TFormSgFqdnRule[]
        setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>
        popoverPosition: TooltipPlacement
      }
    | {
        type: 'sgCidr'
        data: TFormRuleChangesResult<TFormSgCidrRule>
        defaultTraffic: TTraffic
        rules: TFormSgCidrRule[]
        setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>
        popoverPosition: TooltipPlacement
      }
    | {
        type: 'sgCidrIcmp'
        data: TFormRuleChangesResult<TFormSgCidrIcmpRule>
        popoverPosition: TooltipPlacement
        defaultTraffic: TTraffic
        rules: TFormSgCidrIcmpRule[]
        setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>
      }
}

export const RulesDiff: FC<TRulesDiffProps> = ({ title, compareResult }) => {
  const [editOpenNewRules, setEditOpenNewRules] = useState<boolean[]>([])
  const [editOpenModifiedRules, setEditOpenModifiedRules] = useState<boolean[]>([])
  const [editOpenDeletedRules, setEditOpenDeletedRules] = useState<boolean[]>([])

  if (compareResult.type === 'sgSg') {
    return (
      <>
        <TitleWithNoTopMargin level={5}>{title}</TitleWithNoTopMargin>
        {compareResult.data.newRules.length > 0 && (
          <>
            <Typography.Paragraph>New Rules:</Typography.Paragraph>
            <SgSgTable
              isChangesMode
              rulesData={compareResult.data.newRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              rulesOtherside={compareResult.rulesOtherside}
              setRulesOtherside={compareResult.setRulesOtherside}
              setEditOpen={setEditOpenNewRules}
              editOpen={editOpenNewRules}
              popoverPosition={compareResult.popoverPosition}
              centerSg={compareResult.centerSg}
            />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgTable
              isChangesMode
              rulesData={compareResult.data.diffRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              rulesOtherside={compareResult.rulesOtherside}
              setRulesOtherside={compareResult.setRulesOtherside}
              setEditOpen={setEditOpenModifiedRules}
              editOpen={editOpenModifiedRules}
              popoverPosition={compareResult.popoverPosition}
              centerSg={compareResult.centerSg}
            />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgTable
              isChangesMode
              rulesData={compareResult.data.deletedRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              rulesOtherside={compareResult.rulesOtherside}
              setRulesOtherside={compareResult.setRulesOtherside}
              setEditOpen={setEditOpenDeletedRules}
              editOpen={editOpenDeletedRules}
              popoverPosition={compareResult.popoverPosition}
              centerSg={compareResult.centerSg}
              isRestoreButtonActive
            />
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
            <SgSgIcmpTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              rulesData={compareResult.data.newRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              rulesOtherside={compareResult.rulesOtherside}
              setRulesOtherside={compareResult.setRulesOtherside}
              editOpen={editOpenNewRules}
              setEditOpen={setEditOpenNewRules}
              centerSg={compareResult.centerSg}
            />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIcmpTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              rulesData={compareResult.data.diffRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              rulesOtherside={compareResult.rulesOtherside}
              setRulesOtherside={compareResult.setRulesOtherside}
              editOpen={editOpenModifiedRules}
              setEditOpen={setEditOpenModifiedRules}
              centerSg={compareResult.centerSg}
            />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIcmpTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              rulesData={compareResult.data.deletedRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              rulesOtherside={compareResult.rulesOtherside}
              setRulesOtherside={compareResult.setRulesOtherside}
              editOpen={editOpenDeletedRules}
              setEditOpen={setEditOpenDeletedRules}
              centerSg={compareResult.centerSg}
              isRestoreButtonActive
            />
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
            <SgSgIeTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.newRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenNewRules}
              editOpen={editOpenNewRules}
            />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIeTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.diffRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenModifiedRules}
              editOpen={editOpenModifiedRules}
            />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIeTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.deletedRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenDeletedRules}
              editOpen={editOpenDeletedRules}
              isRestoreButtonActive
            />
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
            <SgSgIeIcmpTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.newRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              editOpen={editOpenNewRules}
              setEditOpen={setEditOpenNewRules}
            />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgSgIeIcmpTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.diffRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              editOpen={editOpenModifiedRules}
              setEditOpen={setEditOpenModifiedRules}
            />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgSgIeIcmpTable
              isChangesMode
              popoverPosition={compareResult.popoverPosition}
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.deletedRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              editOpen={editOpenDeletedRules}
              setEditOpen={setEditOpenDeletedRules}
              isRestoreButtonActive
            />
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
            <SgFqdnTable
              isChangesMode
              rulesData={compareResult.data.newRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenNewRules}
              editOpen={editOpenNewRules}
              popoverPosition={compareResult.popoverPosition}
            />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgFqdnTable
              isChangesMode
              rulesData={compareResult.data.diffRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenModifiedRules}
              editOpen={editOpenModifiedRules}
              popoverPosition={compareResult.popoverPosition}
            />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgFqdnTable
              isChangesMode
              rulesData={compareResult.data.deletedRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenDeletedRules}
              editOpen={editOpenDeletedRules}
              popoverPosition={compareResult.popoverPosition}
              isRestoreButtonActive
            />
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
            <SgCidrTable
              isChangesMode
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.newRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenNewRules}
              editOpen={editOpenNewRules}
              popoverPosition={compareResult.popoverPosition}
            />
          </>
        )}
        {compareResult.data.diffRules.length > 0 && (
          <>
            <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
            <SgCidrTable
              isChangesMode
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.diffRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenModifiedRules}
              editOpen={editOpenModifiedRules}
              popoverPosition={compareResult.popoverPosition}
            />
          </>
        )}
        {compareResult.data.deletedRules.length > 0 && (
          <>
            <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
            <SgCidrTable
              isChangesMode
              defaultTraffic={compareResult.defaultTraffic}
              rulesData={compareResult.data.deletedRules}
              rulesAll={compareResult.rules}
              setRules={compareResult.setRules}
              setEditOpen={setEditOpenDeletedRules}
              editOpen={editOpenDeletedRules}
              popoverPosition={compareResult.popoverPosition}
              isRestoreButtonActive
            />
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
          <SgCidrIcmpTable
            isChangesMode
            popoverPosition={compareResult.popoverPosition}
            defaultTraffic={compareResult.defaultTraffic}
            rulesData={compareResult.data.newRules}
            rulesAll={compareResult.rules}
            setRules={compareResult.setRules}
            editOpen={editOpenNewRules}
            setEditOpen={setEditOpenNewRules}
          />
        </>
      )}
      {compareResult.data.diffRules.length > 0 && (
        <>
          <Typography.Paragraph>Diff Rules:</Typography.Paragraph>
          <SgCidrIcmpTable
            isChangesMode
            popoverPosition={compareResult.popoverPosition}
            defaultTraffic={compareResult.defaultTraffic}
            rulesData={compareResult.data.diffRules}
            rulesAll={compareResult.rules}
            setRules={compareResult.setRules}
            editOpen={editOpenModifiedRules}
            setEditOpen={setEditOpenModifiedRules}
          />
        </>
      )}
      {compareResult.data.deletedRules.length > 0 && (
        <>
          <Typography.Paragraph>Deleted Rules:</Typography.Paragraph>
          <SgCidrIcmpTable
            isChangesMode
            popoverPosition={compareResult.popoverPosition}
            defaultTraffic={compareResult.defaultTraffic}
            rulesData={compareResult.data.deletedRules}
            rulesAll={compareResult.rules}
            setRules={compareResult.setRules}
            editOpen={editOpenDeletedRules}
            setEditOpen={setEditOpenDeletedRules}
            isRestoreButtonActive
          />
        </>
      )}
    </>
  )
}
