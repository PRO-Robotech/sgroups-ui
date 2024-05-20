import React, { FC } from 'react'
import { TFormChanges } from 'localTypes/rules'
import { ShortenedTextWithTooltip } from 'components/atoms'
import { Styled } from '../../styled'

type TPortsCellProps = {
  port: string | undefined
  changesMarker: string
  formChanges?: TFormChanges
}

export const PortsCell: FC<TPortsCellProps> = ({ port, changesMarker, formChanges }) => {
  return (
    <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes(changesMarker)} className="no-scroll">
      {!port || port.length === 0 ? 'any' : <ShortenedTextWithTooltip text={port} />}
    </Styled.RulesEntryPorts>
  )
}
