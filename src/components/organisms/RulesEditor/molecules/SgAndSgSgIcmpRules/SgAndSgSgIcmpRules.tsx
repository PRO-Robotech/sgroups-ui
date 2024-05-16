import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { TFormSgRule, TFormSgSgIcmpRule } from 'localTypes/rules'
import { Spacer } from 'components'
import { SGRules } from '../SGRules'
import { SgSgIcmpRules } from '../SgSgIcmpRules'
import { Styled } from '../styled'

type TSgAndSgSgIcmpRulesProps = {
  forceArrowsUpdate: () => void
  sgNames: string[]
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgRule[]
  setRules: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesOtherside: TFormSgRule[]
  setRulesOtherside: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesIcmp: TFormSgSgIcmpRule[]
  setRulesIcmp: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesOthersideIcmp: TFormSgSgIcmpRule[]
  setRulesOthersideIcmp: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  centerSg?: string
  isDisabled?: boolean
}

export const SgAndSgSgIcmpRules: FC<TSgAndSgSgIcmpRulesProps> = ({
  forceArrowsUpdate,
  sgNames,
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
          <SGRules
            forceArrowsUpdate={forceArrowsUpdate}
            sgNames={sgNames}
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
            sgNames={sgNames}
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
