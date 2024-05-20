import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TFormSgSgRule, TFormSgSgIcmpRule } from 'localTypes/rules'
import { Spacer } from 'components'
import { SgSgRules } from '../SgSgRules'
import { SgSgIcmpRules } from '../SgSgIcmpRules'
import { Styled } from '../styled'

type TGroupSgAndSgSgIcmpRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgSgRule[]
  setRules: ActionCreatorWithPayload<TFormSgSgRule[]>
  rulesOtherside: TFormSgSgRule[]
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>
  rulesIcmp: TFormSgSgIcmpRule[]
  setRulesIcmp: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
  rulesOthersideIcmp: TFormSgSgIcmpRule[]
  setRulesOthersideIcmp: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
  centerSg?: string
  isDisabled?: boolean
}

export const GroupSgAndSgSgIcmpRules: FC<TGroupSgAndSgSgIcmpRulesProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  rules,
  setRules,
  rulesOtherside,
  setRulesOtherside,
  rulesIcmp,
  setRulesIcmp,
  rulesOthersideIcmp,
  setRulesOthersideIcmp,
  centerSg,
  isDisabled,
}) => {
  const [tab, setTab] = useState('tcpudp')

  const options = [
    { label: 'TCP/UDP', value: 'tcpudp' },
    { label: 'ICMP', value: 'icmp' },
  ]

  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setTab(value)
    forceArrowsUpdate()
  }

  return (
    <Styled.GroupRulesNode>
      <Styled.RadioGroup>
        <Radio.Group
          options={options}
          onChange={onChange}
          defaultValue="tcpudp"
          optionType="button"
          buttonStyle="solid"
        />
      </Styled.RadioGroup>
      <Spacer $space={10} $samespace />
      <Styled.ContainerAfterSwitcher>
        {tab === 'tcpudp' && (
          <SgSgRules
            forceArrowsUpdate={forceArrowsUpdate}
            title={title}
            popoverPosition={popoverPosition}
            rules={rules}
            setRules={setRules}
            rulesOtherside={rulesOtherside}
            setRulesOtherside={setRulesOtherside}
            centerSg={centerSg}
            isDisabled={isDisabled}
          />
        )}
        {tab === 'icmp' && (
          <SgSgIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title={title}
            popoverPosition={popoverPosition}
            rules={rulesIcmp}
            setRules={setRulesIcmp}
            rulesOtherside={rulesOthersideIcmp}
            setRulesOtherside={setRulesOthersideIcmp}
            centerSg={centerSg}
            isDisabled={isDisabled}
          />
        )}
      </Styled.ContainerAfterSwitcher>
    </Styled.GroupRulesNode>
  )
}
