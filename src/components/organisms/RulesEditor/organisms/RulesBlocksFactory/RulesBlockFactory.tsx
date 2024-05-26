import React, { FC, useState } from 'react'
import { TooltipPlacement } from 'antd/es/tooltip'
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
  popoverPosition: TooltipPlacement
  title: string
  type: 'sgSg' | 'sgSgIcmp' | 'sgSgIe' | 'sgSgIeIcmp' | 'sgFqdn' | 'sgCidr' | 'sgCidrIcmp'
  subtype: 'from' | 'to'
  isDisabled?: boolean
  forceArrowsUpdate?: () => void
  inTransformBlock?: boolean
  addpopoverPosition?: TooltipPlacement
}

export const RulesBlockFactory: FC<TRulesBlockFactoryProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  addpopoverPosition,
  isDisabled,
  inTransformBlock,
  type,
  subtype,
}) => {
  const [editOpen, setEditOpen] = useState<boolean[]>([])

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

  if (type === 'sgSg') {
    return (
      <RulesBlock<TFormSgSgRule>
        title={title}
        openSpecificName={`sgSg-${subtype}`}
        popoverPosition={addpopoverPosition || popoverPosition}
        table={
          <SgSgTable
            isChangesMode={false}
            rulesAll={subtype === 'from' ? rulesSgSgFrom : rulesSgSgTo}
            rulesData={subtype === 'from' ? rulesSgSgFrom : rulesSgSgTo}
            setRules={subtype === 'from' ? setRulesSgSgFrom : setRulesSgSgTo}
            rulesOtherside={subtype === 'from' ? rulesSgSgTo : rulesSgSgFrom}
            setRulesOtherside={subtype === 'from' ? setRulesSgSgTo : setRulesSgSgFrom}
            popoverPosition={popoverPosition}
            setEditOpen={setEditOpen}
            editOpen={editOpen}
            centerSg={centerSg}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSg}
        rules={subtype === 'from' ? rulesSgSgFrom : rulesSgSgTo}
        setRules={subtype === 'from' ? setRulesSgSgFrom : setRulesSgSgTo}
        legacyOptions={{
          centerSg,
          rulesOtherside: subtype === 'from' ? rulesSgSgTo : rulesSgSgFrom,
          setRulesOtherside: subtype === 'from' ? setRulesSgSgTo : setRulesSgSgFrom,
        }}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSg}
        inTransformBlock={inTransformBlock}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIcmp') {
    return (
      <RulesBlock<TFormSgSgIcmpRule>
        title={title}
        openSpecificName={`sgSgIcmp-${subtype}`}
        popoverPosition={addpopoverPosition || popoverPosition}
        table={
          <SgSgIcmpTable
            isChangesMode={false}
            popoverPosition={popoverPosition}
            rulesAll={subtype === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo}
            rulesData={subtype === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo}
            setRules={subtype === 'from' ? setRulesSgSgIcmpFrom : setRulesSgSgIcmpTo}
            rulesOtherside={subtype === 'from' ? rulesSgSgIcmpTo : rulesSgSgIcmpFrom}
            setRulesOtherside={subtype === 'from' ? setRulesSgSgIcmpTo : setRulesSgSgIcmpFrom}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            centerSg={centerSg}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIcmp}
        rules={subtype === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo}
        setRules={subtype === 'from' ? setRulesSgSgIcmpFrom : setRulesSgSgIcmpTo}
        legacyOptions={{
          centerSg,
          rulesOtherside: subtype === 'from' ? rulesSgSgIcmpTo : rulesSgSgIcmpFrom,
          setRulesOtherside: subtype === 'from' ? setRulesSgSgIcmpTo : setRulesSgSgIcmpFrom,
        }}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIcmp}
        inTransformBlock={inTransformBlock}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIe') {
    return (
      <RulesBlock<TFormSgSgIeRule>
        title={title}
        openSpecificName={`sgSgIe-${subtype}`}
        popoverPosition={addpopoverPosition || popoverPosition}
        table={
          <SgSgIeTable
            isChangesMode={false}
            popoverPosition={popoverPosition}
            defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
            rulesAll={subtype === 'from' ? rulesSgSgIeFrom : rulesSgSgIeTo}
            rulesData={subtype === 'from' ? rulesSgSgIeFrom : rulesSgSgIeTo}
            setRules={subtype === 'from' ? setRulesSgSgIeFrom : setRulesSgSgIeTo}
            setEditOpen={setEditOpen}
            editOpen={editOpen}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIe}
        rules={subtype === 'from' ? rulesSgSgIeFrom : rulesSgSgIeTo}
        setRules={subtype === 'from' ? setRulesSgSgIeFrom : setRulesSgSgIeTo}
        defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIe}
        inTransformBlock={inTransformBlock}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgSgIeIcmp') {
    return (
      <RulesBlock<TFormSgSgIeIcmpRule>
        title={title}
        openSpecificName={`sgSgIeIcmp-${subtype}`}
        popoverPosition={addpopoverPosition || popoverPosition}
        table={
          <SgSgIeIcmpTable
            isChangesMode={false}
            popoverPosition={popoverPosition}
            defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
            rulesAll={subtype === 'from' ? rulesSgSgIeIcmpFrom : rulesSgSgIeIcmpTo}
            rulesData={subtype === 'from' ? rulesSgSgIeIcmpFrom : rulesSgSgIeIcmpTo}
            setRules={subtype === 'from' ? setRulesSgSgIeIcmpFrom : setRulesSgSgIeIcmpTo}
            setEditOpen={setEditOpen}
            editOpen={editOpen}
            isDisabled={isDisabled}
            forceArrowsUpdate={forceArrowsUpdate}
          />
        }
        ruleConfig={RULES_CONFIGS.sgSgIeIcmp}
        rules={subtype === 'from' ? rulesSgSgIeIcmpFrom : rulesSgSgIeIcmpTo}
        setRules={subtype === 'from' ? setRulesSgSgIeIcmpFrom : setRulesSgSgIeIcmpTo}
        defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIeIcmp}
        inTransformBlock={inTransformBlock}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgFqdn') {
    return (
      <RulesBlock<TFormSgFqdnRule>
        title={title}
        openSpecificName={`sgFqdn-${subtype}`}
        popoverPosition={addpopoverPosition || popoverPosition}
        table={
          <SgFqdnTable
            isChangesMode={false}
            rulesAll={subtype === 'from' ? [] : rulesSgFqdnTo}
            rulesData={subtype === 'from' ? [] : rulesSgFqdnTo}
            setRules={subtype === 'from' ? setRulesSgFqdnTo : setRulesSgFqdnTo}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            popoverPosition={popoverPosition}
            forceArrowsUpdate={forceArrowsUpdate}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgFqdn}
        rules={subtype === 'from' ? [] : rulesSgFqdnTo}
        setRules={subtype === 'from' ? setRulesSgFqdnTo : setRulesSgFqdnTo}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToFqdn}
        inTransformBlock={inTransformBlock}
        isDisabled={isDisabled}
      />
    )
  }
  if (type === 'sgCidr') {
    return (
      <RulesBlock<TFormSgCidrRule>
        title={title}
        openSpecificName={`sgCidr-${subtype}`}
        popoverPosition={addpopoverPosition || popoverPosition}
        table={
          <SgCidrTable
            isChangesMode={false}
            rulesAll={subtype === 'from' ? rulesSgCidrFrom : rulesSgCidrTo}
            rulesData={subtype === 'from' ? rulesSgCidrFrom : rulesSgCidrTo}
            setRules={subtype === 'from' ? setRulesSgCidrFrom : setRulesSgCidrTo}
            editOpen={editOpen}
            setEditOpen={setEditOpen}
            defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
            popoverPosition={popoverPosition}
            forceArrowsUpdate={forceArrowsUpdate}
            isDisabled={isDisabled}
          />
        }
        ruleConfig={RULES_CONFIGS.sgCidr}
        rules={subtype === 'from' ? rulesSgCidrFrom : rulesSgCidrTo}
        setRules={subtype === 'from' ? setRulesSgCidrFrom : setRulesSgCidrTo}
        defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToCidrIe}
        inTransformBlock={inTransformBlock}
        isDisabled={isDisabled}
      />
    )
  }
  return (
    <RulesBlock<TFormSgCidrIcmpRule>
      title={title}
      openSpecificName={`sgCidrIcmp-${subtype}`}
      popoverPosition={addpopoverPosition || popoverPosition}
      table={
        <SgCidrIcmpTable
          isChangesMode={false}
          popoverPosition={popoverPosition}
          defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
          rulesAll={subtype === 'from' ? rulesSgCidrIcmpFrom : rulesSgCidrIcmpTo}
          rulesData={subtype === 'from' ? rulesSgCidrIcmpFrom : rulesSgCidrIcmpTo}
          setRules={subtype === 'from' ? setRulesSgCidrIcmpFrom : setRulesSgCidrIcmpTo}
          setEditOpen={setEditOpen}
          editOpen={editOpen}
          isDisabled={isDisabled}
          forceArrowsUpdate={forceArrowsUpdate}
        />
      }
      ruleConfig={RULES_CONFIGS.sgCidrIcmp}
      rules={subtype === 'from' ? rulesSgCidrIcmpFrom : rulesSgCidrIcmpTo}
      setRules={subtype === 'from' ? setRulesSgCidrIcmpFrom : setRulesSgCidrIcmpTo}
      defaultTraffic={subtype === 'from' ? 'Ingress' : 'Egress'}
      defaultPrioritySome={DEFAULT_PRIORITIES.sgToCidrIeIcmp}
      inTransformBlock={inTransformBlock}
      isDisabled={isDisabled}
    />
  )
}
