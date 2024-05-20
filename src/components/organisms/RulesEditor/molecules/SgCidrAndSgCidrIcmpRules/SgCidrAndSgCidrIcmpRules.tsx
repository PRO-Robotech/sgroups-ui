import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TFormSgCidrRule, TFormSgCidrIcmpRule, TTraffic } from 'localTypes/rules'
import { Spacer } from 'components'
import { SgCidrRules } from '../SgCidrRules'
import { SgCidrIcmpRules } from '../SgCidrIcmpRules'
import { Styled } from '../styled'

type TSgCidrAndSgCidrIcmpRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgCidrRule[]
  setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>
  rulesIcmp: TFormSgCidrIcmpRule[]
  setRulesIcmp: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>
  defaultTraffic: TTraffic
  isDisabled?: boolean
}

export const SgCidrAndSgCidrIcmpRules: FC<TSgCidrAndSgCidrIcmpRulesProps> = ({
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
          <SgCidrRules
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
          <SgCidrIcmpRules
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
