import React, { FC } from 'react'
import { TActionType } from 'localTypes/rules'
import { Styled } from './styled'

type TActionCellProps = {
  action: TActionType
}

export const ActionCell: FC<TActionCellProps> = ({ action }) => {
  return (
    <div>
      {action === 'ACCEPT' ? (
        <Styled.CustomTag $isAccept>ACCEPT</Styled.CustomTag>
      ) : (
        <Styled.CustomTag>DROP</Styled.CustomTag>
      )}
    </div>
  )
}
