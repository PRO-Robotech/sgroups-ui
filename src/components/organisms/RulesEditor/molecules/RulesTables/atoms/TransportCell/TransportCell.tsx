import React, { FC } from 'react'
import { TFormChanges, TTransport } from 'localTypes/rules'
import { Styled } from '../../styled'

type TTransportCellProps = {
  transport: TTransport
  formChanges?: TFormChanges
}

export const TransportCell: FC<TTransportCellProps> = ({ transport, formChanges }) => {
  return (
    <Styled.RulesEntryTransport
      $transport={transport}
      $modified={formChanges?.modifiedFields?.includes('transport')}
      className="no-scroll"
    >
      {transport}
    </Styled.RulesEntryTransport>
  )
}
