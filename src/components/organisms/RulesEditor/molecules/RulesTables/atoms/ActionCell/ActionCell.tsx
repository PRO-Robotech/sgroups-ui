import React, { FC } from 'react'
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TActionType, TFormChanges } from 'localTypes/rules'
import { Styled } from '../../styled'

type TActionCellProps = {
  action: TActionType
  formChanges?: TFormChanges
}

export const ActionCell: FC<TActionCellProps> = ({ action, formChanges }) => {
  return (
    <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('action')} className="no-scroll">
      {action === 'ACCEPT' ? <LikeOutlined style={{ color: 'green' }} /> : <DislikeOutlined style={{ color: 'red' }} />}
    </Styled.RulesEntryPorts>
  )
}
