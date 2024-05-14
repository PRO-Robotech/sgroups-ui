import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TFormCidrSgRule, TFormCidrSgIcmpRule, TTraffic } from 'localTypes/rules'
import { Spacer } from 'components'
import { CidrSGRules } from '../CidrSGRules'
import { CidrSgIcmpRules } from '../CidrSgIcmpRules'
import { Styled } from '../styled'

type TCidrSgAndCidrSgIcmpRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormCidrSgRule[]
  setRules: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesIcmp: TFormCidrSgIcmpRule[]
  setRulesIcmp: Dispatch<SetStateAction<TFormCidrSgIcmpRule[]>>
  defaultTraffic: TTraffic
  isDisabled?: boolean
}

export const CidrSgAndCidrSgIcmpRules: FC<TCidrSgAndCidrSgIcmpRulesProps> = ({
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
      {tab === 'tcpudp' && (
        <CidrSGRules
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
        <CidrSgIcmpRules
          forceArrowsUpdate={forceArrowsUpdate}
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
