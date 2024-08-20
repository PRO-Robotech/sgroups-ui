import React, { FC } from 'react'
import { TFormChangesStatuses } from 'localTypes/rules'
import { Styled } from './styled'

type TStatusCellProps = {
  status?: TFormChangesStatuses
}

export const StatusCell: FC<TStatusCellProps> = ({ status }) => {
  if (status === 'new') {
    return (
      <div>
        <Styled.CustomTag $status={status}>Added</Styled.CustomTag>
      </div>
    )
  }

  if (status === 'modified') {
    return (
      <div>
        <Styled.CustomTag $status={status}>Modified</Styled.CustomTag>
      </div>
    )
  }

  if (status === 'deleted') {
    return (
      <div>
        <Styled.CustomTag $status={status}>Deleted</Styled.CustomTag>
      </div>
    )
  }

  return null
}
