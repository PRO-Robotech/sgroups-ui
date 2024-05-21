import React, { FC, useState } from 'react'
import { TooltipPlacement } from 'antd/es/tooltip'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
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
} from '../../molecules/RulesTables'
import { RULES_CONFIGS } from '../../constants'
import { RulesBlock } from './molecules'

type TRulesBlockFactoryProps = {
  forceArrowsUpdate: () => void
  popoverPosition: TooltipPlacement
  title: string
  isDisabled?: boolean
} & (
  | {
      type: 'sgSg'
      data: {
        rules: TFormSgSgRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgRule[]>
        rulesOtherside: TFormSgSgRule[]
        setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>
        centerSg?: string
      }
    }
  | {
      type: 'sgSgIcmp'
      data: {
        rules: TFormSgSgIcmpRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
        rulesOtherside: TFormSgSgIcmpRule[]
        setRulesOtherside: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
        centerSg?: string
      }
    }
  | {
      type: 'sgSgIe'
      data: {
        rules: TFormSgSgIeRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>
        defaultTraffic: TTraffic
      }
    }
  | {
      type: 'sgSgIeIcmp'
      data: {
        rules: TFormSgSgIeIcmpRule[]
        setRules: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>
        defaultTraffic: TTraffic
      }
    }
  | {
      type: 'sgFqdn'
      data: {
        rules: TFormSgFqdnRule[]
        setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>
      }
    }
  | {
      type: 'sgCidr'
      data: {
        rules: TFormSgCidrRule[]
        setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>
        defaultTraffic: TTraffic
      }
    }
  | {
      type: 'sgCidrIcmp'
      data: {
        rules: TFormSgCidrIcmpRule[]
        setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>
        defaultTraffic: TTraffic
      }
    }
)

export const RulesBlockFactory: FC<TRulesBlockFactoryProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  isDisabled,
  type,
  data,
}) => {
  const [editOpen, setEditOpen] = useState<boolean[]>([])

  if (type === 'sgSg') {
    return (
      <RulesBlock<TFormSgSgRule>
        title={title}
        popoverPosition={popoverPosition}
        table={
          <SgSgTable
            isChangesMode={false}
            rulesAll={data.rules}
            rulesData={data.rules}
            setRules={data.setRules}
            rulesOtherside={data.rulesOtherside}
            setRulesOtherside={data.setRulesOtherside}
            popoverPosition={popoverPosition}
            setEditOpen={setEditOpen}
            editOpen={editOpen}
            centerSg={data.centerSg}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSg}
        rules={data.rules}
        setRules={data.setRules}
        legacyOptions={{
          centerSg: data.centerSg,
          rulesOtherside: data.rulesOtherside,
          setRulesOtherside: data.setRulesOtherside,
        }}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIcmp') {
    return (
      <RulesBlock<TFormSgSgIcmpRule>
        title={title}
        popoverPosition={popoverPosition}
        table={
          <SgSgIcmpTable
            isChangesMode={false}
            popoverPosition={popoverPosition}
            rulesAll={data.rules}
            rulesData={data.rules}
            setRules={data.setRules}
            rulesOtherside={data.rulesOtherside}
            setRulesOtherside={data.setRulesOtherside}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            centerSg={data.centerSg}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIcmp}
        rules={data.rules}
        setRules={data.setRules}
        legacyOptions={{
          centerSg: data.centerSg,
          rulesOtherside: data.rulesOtherside,
          setRulesOtherside: data.setRulesOtherside,
        }}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIe') {
    return (
      <RulesBlock<TFormSgSgIeRule>
        title={title}
        popoverPosition={popoverPosition}
        table={
          <SgSgIeTable
            isChangesMode={false}
            popoverPosition={popoverPosition}
            defaultTraffic={data.defaultTraffic}
            rulesAll={data.rules}
            rulesData={data.rules}
            setRules={data.setRules}
            setEditOpen={setEditOpen}
            editOpen={editOpen}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIe}
        rules={data.rules}
        setRules={data.setRules}
        defaultTraffic={data.defaultTraffic}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIeIcmp') {
    return (
      <RulesBlock<TFormSgSgIeIcmpRule>
        title={title}
        popoverPosition={popoverPosition}
        table={
          <SgSgIeIcmpTable
            isChangesMode={false}
            popoverPosition={popoverPosition}
            defaultTraffic={data.defaultTraffic}
            rulesAll={data.rules}
            rulesData={data.rules}
            setRules={data.setRules}
            setEditOpen={setEditOpen}
            editOpen={editOpen}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIeIcmp}
        rules={data.rules}
        setRules={data.setRules}
        defaultTraffic={data.defaultTraffic}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgFqdn') {
    return (
      <RulesBlock<TFormSgFqdnRule>
        title={title}
        popoverPosition={popoverPosition}
        table={
          <SgFqdnTable
            isChangesMode={false}
            rulesAll={data.rules}
            rulesData={data.rules}
            setRules={data.setRules}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            popoverPosition={popoverPosition}
            forceArrowsUpdate={forceArrowsUpdate}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgFqdn}
        rules={data.rules}
        setRules={data.setRules}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgCidr') {
    return (
      <RulesBlock<TFormSgCidrRule>
        title={title}
        popoverPosition={popoverPosition}
        table={
          <SgCidrTable
            isChangesMode={false}
            rulesAll={data.rules}
            rulesData={data.rules}
            setRules={data.setRules}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            defaultTraffic={data.defaultTraffic}
            popoverPosition={popoverPosition}
            forceArrowsUpdate={forceArrowsUpdate}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgCidr}
        rules={data.rules}
        setRules={data.setRules}
        defaultTraffic={data.defaultTraffic}
        isDisabled={isDisabled}
      />
    )
  }
  return (
    <RulesBlock<TFormSgCidrIcmpRule>
      title={title}
      popoverPosition={popoverPosition}
      table={
        <SgCidrIcmpTable
          isChangesMode={false}
          popoverPosition={popoverPosition}
          defaultTraffic={data.defaultTraffic}
          rulesAll={data.rules}
          rulesData={data.rules}
          setRules={data.setRules}
          setEditOpen={setEditOpen}
          editOpen={editOpen}
          isDisabled={isDisabled}
          forceArrowsUpdate={forceArrowsUpdate}
        />
      }
      ruleConfig={RULES_CONFIGS.sgCidrIcmp}
      rules={data.rules}
      setRules={data.setRules}
      defaultTraffic={data.defaultTraffic}
      isDisabled={isDisabled}
    />
  )
}
