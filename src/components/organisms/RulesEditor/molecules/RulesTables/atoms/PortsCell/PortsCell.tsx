import React, { FC } from 'react'
import { Popover, Tag } from 'antd'
import { TFormChanges, TPortGroup } from 'localTypes/rules'
import { Styled as CommonStyled } from '../../styled'
import { Styled } from './styled'

type TPortsCellProps = {
  ports: TPortGroup[]
  changesMarker: string
  formChanges?: TFormChanges
}

export const PortsCell: FC<TPortsCellProps> = ({ ports, changesMarker, formChanges }) => {
  const popoverContent = (
    <Styled.PopoverContainer>
      {ports.map(({ s, d }) => (
        <Tag key={`${s || 'any'}${d || 'any'}`}>
          {!s || s.length === 0 ? 'any' : s} : {!d || d.length === 0 ? 'any' : d}
        </Tag>
      ))}
    </Styled.PopoverContainer>
  )

  return (
    <CommonStyled.RulesEntryPorts
      $modified={formChanges?.modifiedFields?.includes(changesMarker)}
      className="no-scroll"
    >
      <Popover title="Ports" content={popoverContent}>
        <Styled.InlineContainerWidthMaxWidth>
          {ports.map(({ s, d }) => (
            <Styled.PortsEntry key={`${s || 'any'}${d || 'any'}`}>
              {!s || s.length === 0 ? 'any' : s} : {!d || d.length === 0 ? 'any' : d}
            </Styled.PortsEntry>
          ))}
        </Styled.InlineContainerWidthMaxWidth>
      </Popover>
    </CommonStyled.RulesEntryPorts>
  )
}
