import React, { FC, ReactNode, useState } from 'react'
import { Radio } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { Spacer } from 'components'
import { Styled } from './styled'

type TTcpUdpAndIcmpSwitcherProps = {
  forceArrowsUpdate: () => void
  tcpUdpComponent: ReactNode
  icmpComponent: ReactNode
}

export const TcpUdpAndIcmpSwitcher: FC<TTcpUdpAndIcmpSwitcherProps> = ({
  forceArrowsUpdate,
  tcpUdpComponent,
  icmpComponent,
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
        {tab === 'tcpudp' && tcpUdpComponent}
        {tab === 'icmp' && icmpComponent}
      </Styled.ContainerAfterSwitcher>
    </Styled.GroupRulesNode>
  )
}
