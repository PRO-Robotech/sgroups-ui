import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TFormSgSgIeRule, TFormSgSgIeIcmpRule, TTraffic } from 'localTypes/rules'
import { Spacer } from 'components'
import { SgSgIeRules } from '../SgSgIeRules'
import { SgSgIeIcmpRules } from '../SgSgIeIcmpRules'
import { Styled } from '../styled'

type TSgSgIeAndSgSgIeIcmpRulesProps = {
  forceArrowsUpdate: () => void
  sgNames: string[]
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgSgIeRule[]
  setRules: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  rulesIcmp: TFormSgSgIeIcmpRule[]
  setRulesIcmp: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
  defaultTraffic: TTraffic
  isDisabled?: boolean
}

export const SgSgIeAndSgSgIeIcmpRules: FC<TSgSgIeAndSgSgIeIcmpRulesProps> = ({
  forceArrowsUpdate,
  sgNames,
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
      {tab === 'tcpudp' && (
        <SgSgIeRules
          forceArrowsUpdate={forceArrowsUpdate}
          sgNames={sgNames}
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
          sgNames={sgNames}
          title={title}
          popoverPosition={popoverPosition}
          rules={rulesIcmp}
          setRules={setRulesIcmp}
          defaultTraffic={defaultTraffic}
          isDisabled={isDisabled}
        />
      )}
    </Styled.GroupRulesNode>
  )
}
