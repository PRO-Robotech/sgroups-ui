import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Segmented } from 'antd'
import { SelectCenterSg } from '../../molecules'
import {
  SgSgIcmpFrom,
  SgSgTcpUdpFrom,
  SgSgIcmpTo,
  SgSgTcpUdpTo,
  SgSgIeIcmpFrom,
  SgSgIeTcpUdpFrom,
  SgSgIeIcmpTo,
  SgSgIeTcpUdpTo,
  SgFqdnTo,
  SgCidrIcmpFrom,
  SgCidrTcpUdpFrom,
  SgCidrIcmpTo,
  SgCidrTcpUdpTo,
} from '../../organisms'
import { Styled } from './styled'

type TRulesSimplifiedProps = {
  onSelectCenterSg: (value?: string) => void
  byTypeId?: string
}

export const RulesByType: FC<TRulesSimplifiedProps> = ({ onSelectCenterSg, byTypeId }) => {
  const history = useHistory()
  const [currentSection, setCurrentSection] = useState<string>(byTypeId || 'sgSg')

  useEffect(() => {
    if (byTypeId) {
      setCurrentSection(byTypeId)
    }
  }, [byTypeId])

  return (
    <Styled.Container>
      <Styled.Card>
        <Segmented
          options={[
            {
              label: 'SG-SG',
              value: 'sgSg',
            },
            {
              label: 'SG-SG-ICMP',
              value: 'sgSgIcmp',
            },
            {
              label: 'SG-SG-IE',
              value: 'sgSgIe',
            },
            {
              label: 'SG-SG-IE-ICMP',
              value: 'sgSgIeIcmp',
            },
            {
              label: 'SG-CIDR',
              value: 'sgCidr',
            },
            {
              label: 'SG-CIDR-ICMP',
              value: 'sgCidrIcmp',
            },
            {
              label: 'SG-FQDN',
              value: 'sgFqdn',
            },
          ]}
          value={currentSection}
          onChange={value => {
            if (typeof value === 'string') {
              history.push(`/rules-editor/by-type/${value}`)
              setCurrentSection(value)
            }
          }}
        />
      </Styled.Card>
      <Styled.Card>
        <SelectCenterSg onSelectCenterSg={onSelectCenterSg} notInTransformBlock />
      </Styled.Card>
      {currentSection === 'sgSg' && (
        <>
          <Styled.Card>
            <SgSgTcpUdpFrom />
          </Styled.Card>
          <Styled.Card>
            <SgSgTcpUdpTo />
          </Styled.Card>
        </>
      )}
      {currentSection === 'sgSgIcmp' && (
        <>
          <Styled.Card>
            <SgSgIcmpFrom />
          </Styled.Card>
          <Styled.Card>
            <SgSgIcmpTo />
          </Styled.Card>
        </>
      )}
      {currentSection === 'sgSgIe' && (
        <>
          <Styled.Card>
            <SgSgIeTcpUdpFrom />
          </Styled.Card>
          <Styled.Card>
            <SgSgIeTcpUdpTo />
          </Styled.Card>
        </>
      )}
      {currentSection === 'sgSgIeIcmp' && (
        <>
          <Styled.Card>
            <SgSgIeIcmpFrom />
          </Styled.Card>
          <Styled.Card>
            <SgSgIeIcmpTo />
          </Styled.Card>
        </>
      )}
      {currentSection === 'sgCidr' && (
        <>
          <Styled.Card>
            <SgCidrTcpUdpFrom />
          </Styled.Card>
          <Styled.Card>
            <SgCidrTcpUdpTo />
          </Styled.Card>
        </>
      )}
      {currentSection === 'sgCidrIcmp' && (
        <>
          <Styled.Card>
            <SgCidrIcmpFrom />
          </Styled.Card>
          <Styled.Card>
            <SgCidrIcmpTo />
          </Styled.Card>
        </>
      )}
      {currentSection === 'sgFqdn' && (
        <Styled.Card>
          <SgFqdnTo />
        </Styled.Card>
      )}
    </Styled.Container>
  )
}
