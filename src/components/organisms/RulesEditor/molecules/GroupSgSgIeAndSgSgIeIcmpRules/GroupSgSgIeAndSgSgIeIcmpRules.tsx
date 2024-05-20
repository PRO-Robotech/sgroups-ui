import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TFormSgSgIeRule, TFormSgSgIeIcmpRule, TTraffic } from 'localTypes/rules'
import { Spacer } from 'components'
import { SgSgIeRules } from '../SgSgIeRules'
import { SgSgIeIcmpRules } from '../SgSgIeIcmpRules'
import { Styled } from '../styled'

type TGroupSgSgIeAndSgSgIeIcmpRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgSgIeRule[]
  setRules: ActionCreatorWithPayload<TFormSgSgIeRule[]>
  rulesIcmp: TFormSgSgIeIcmpRule[]
  setRulesIcmp: ActionCreatorWithPayload<TFormSgSgIeIcmpRule[]>
  defaultTraffic: TTraffic
  isDisabled?: boolean
}

export const GroupSgSgIeAndSgSgIeIcmpRules: FC<TGroupSgSgIeAndSgSgIeIcmpRulesProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  rules,
  setRules,
  rulesIcmp,
  setRulesIcmp,
  defaultTraffic,
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
          <SgSgIeRules
            forceArrowsUpdate={forceArrowsUpdate}
            title={title}
            popoverPosition={popoverPosition}
            rules={rules}
            setRules={setRules}
            defaultTraffic={defaultTraffic}
            isDisabled={isDisabled}
          />
        )}
        {tab === 'icmp' && (
          <SgSgIeIcmpRules
            forceArrowsUpdate={forceArrowsUpdate}
            title={title}
            popoverPosition={popoverPosition}
            rules={rulesIcmp}
            setRules={setRulesIcmp}
            defaultTraffic={defaultTraffic}
            isDisabled={isDisabled}
          />
        )}
      </Styled.ContainerAfterSwitcher>
    </Styled.GroupRulesNode>
  )
}
