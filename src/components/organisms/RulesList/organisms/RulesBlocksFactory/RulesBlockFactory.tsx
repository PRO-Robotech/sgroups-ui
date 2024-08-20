import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { setRulesSgSgIeFrom, setRulesSgSgIeTo } from 'store/editor/rulesSgSgIe/rulesSgSgIe'
import { setRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpTo } from 'store/editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { setRulesSgFqdnTo } from 'store/editor/rulesSgFqdn/rulesSgFqdn'
import { setRulesSgCidrFrom, setRulesSgCidrTo } from 'store/editor/rulesSgCidr/rulesSgCidr'
import { setRulesSgCidrIcmpFrom, setRulesSgCidrIcmpTo } from 'store/editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import {
  TFormSgSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormSgFqdnRule,
  TFormSgCidrRule,
  TFormSgCidrIcmpRule,
  TRulesTypes,
  TRulesSubTypes,
} from 'localTypes/rules'
import { DEFAULT_PRIORITIES } from 'constants/rules'
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
  title: string
  type: TRulesTypes
  subtype: TRulesSubTypes
  isDisabledDefault?: boolean
}

export const RulesBlockFactory: FC<TRulesBlockFactoryProps> = ({ title, isDisabledDefault, type, subtype }) => {
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
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

  const isDisabled = isDisabledDefault || !centerSg

  if (type === 'sgSg') {
    return (
      <RulesBlock<TFormSgSgRule>
        title={title}
        table={
          <SgSgTable
            direction={subtype}
            isChangesMode={false}
            rulesData={subtype === 'from' ? rulesSgSgFrom : rulesSgSgTo}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSg}
        direction={subtype === 'from' ? 'Ingress' : 'Egress'}
        rules={subtype === 'from' ? rulesSgSgFrom : rulesSgSgTo}
        setRules={subtype === 'from' ? setRulesSgSgFrom : setRulesSgSgTo}
        legacyOptions={{
          centerSg,
          rulesOtherside: subtype === 'from' ? rulesSgSgTo : rulesSgSgFrom,
          setRulesOtherside: subtype === 'from' ? setRulesSgSgTo : setRulesSgSgFrom,
        }}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSg}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIcmp') {
    return (
      <RulesBlock<TFormSgSgIcmpRule>
        title={title}
        table={
          <SgSgIcmpTable
            direction={subtype}
            isChangesMode={false}
            rulesData={subtype === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIcmp}
        direction={subtype === 'from' ? 'Ingress' : 'Egress'}
        rules={subtype === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo}
        setRules={subtype === 'from' ? setRulesSgSgIcmpFrom : setRulesSgSgIcmpTo}
        legacyOptions={{
          centerSg,
          rulesOtherside: subtype === 'from' ? rulesSgSgIcmpTo : rulesSgSgIcmpFrom,
          setRulesOtherside: subtype === 'from' ? setRulesSgSgIcmpTo : setRulesSgSgIcmpFrom,
        }}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIcmp}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIe') {
    return (
      <RulesBlock<TFormSgSgIeRule>
        title={title}
        table={
          <SgSgIeTable
            direction={subtype}
            isChangesMode={false}
            rulesData={subtype === 'from' ? rulesSgSgIeFrom : rulesSgSgIeTo}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIe}
        direction={subtype === 'from' ? 'Ingress' : 'Egress'}
        rules={subtype === 'from' ? rulesSgSgIeFrom : rulesSgSgIeTo}
        setRules={subtype === 'from' ? setRulesSgSgIeFrom : setRulesSgSgIeTo}
        defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIe}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIeIcmp') {
    return (
      <RulesBlock<TFormSgSgIeIcmpRule>
        title={title}
        table={
          <SgSgIeIcmpTable
            direction={subtype}
            isChangesMode={false}
            rulesData={subtype === 'from' ? rulesSgSgIeIcmpFrom : rulesSgSgIeIcmpTo}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIeIcmp}
        direction={subtype === 'from' ? 'Ingress' : 'Egress'}
        rules={subtype === 'from' ? rulesSgSgIeIcmpFrom : rulesSgSgIeIcmpTo}
        setRules={subtype === 'from' ? setRulesSgSgIeIcmpFrom : setRulesSgSgIeIcmpTo}
        defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIeIcmp}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgFqdn') {
    return (
      <RulesBlock<TFormSgFqdnRule>
        title={title}
        table={
          <SgFqdnTable
            direction={subtype}
            isChangesMode={false}
            rulesData={subtype === 'from' ? [] : rulesSgFqdnTo}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgFqdn}
        direction={subtype === 'from' ? 'Ingress' : 'Egress'}
        rules={subtype === 'from' ? [] : rulesSgFqdnTo}
        setRules={subtype === 'from' ? setRulesSgFqdnTo : setRulesSgFqdnTo}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToFqdn}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgCidr') {
    return (
      <RulesBlock<TFormSgCidrRule>
        title={title}
        table={
          <SgCidrTable
            direction={subtype}
            isChangesMode={false}
            rulesData={subtype === 'from' ? rulesSgCidrFrom : rulesSgCidrTo}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgCidr}
        direction={subtype === 'from' ? 'Ingress' : 'Egress'}
        rules={subtype === 'from' ? rulesSgCidrFrom : rulesSgCidrTo}
        setRules={subtype === 'from' ? setRulesSgCidrFrom : setRulesSgCidrTo}
        defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToCidrIe}
        isDisabled={isDisabled}
      />
    )
  }
  return (
    <RulesBlock<TFormSgCidrIcmpRule>
      title={title}
      table={
        <SgCidrIcmpTable
          direction={subtype}
          isChangesMode={false}
          rulesData={subtype === 'from' ? rulesSgCidrIcmpFrom : rulesSgCidrIcmpTo}
          isDisabled={isDisabled}
        />
      }
      ruleConfig={RULES_CONFIGS.sgCidrIcmp}
      direction={subtype === 'from' ? 'Ingress' : 'Egress'}
      rules={subtype === 'from' ? rulesSgCidrIcmpFrom : rulesSgCidrIcmpTo}
      setRules={subtype === 'from' ? setRulesSgCidrIcmpFrom : setRulesSgCidrIcmpTo}
      defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
      defaultPrioritySome={DEFAULT_PRIORITIES.sgToCidrIeIcmp}
      isDisabled={isDisabled}
    />
  )
}
