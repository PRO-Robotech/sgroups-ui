import React, { FC, Fragment } from 'react'
import { TFormChanges, TPortGroup } from 'localTypes/rules'
import { ShortenedTextWithTooltip } from 'components/atoms'
import { Styled } from '../../styled'

type TPortsCellProps = {
  ports: TPortGroup[]
  changesMarker: string
  formChanges?: TFormChanges
}

export const PortsCell: FC<TPortsCellProps> = ({ ports, changesMarker, formChanges }) => {
  return (
    <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes(changesMarker)} className="no-scroll">
      {ports.map(({ s, d }) => (
        <Fragment key={`${s || 'any'}${d || 'any'}`}>
          {!s || s.length === 0 ? 'any' : <ShortenedTextWithTooltip text={s} />} :
          {!d || d.length === 0 ? 'any' : <ShortenedTextWithTooltip text={d} />}
        </Fragment>
      ))}
    </Styled.RulesEntryPorts>
  )
}
