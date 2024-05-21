import React, { FC } from 'react'
import { Tooltip } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormChanges } from 'localTypes/rules'
import { Styled } from '../../styled'

type TTraceCellProps = {
  trace: boolean
  formChanges?: TFormChanges
}

export const TraceCell: FC<TTraceCellProps> = ({ trace, formChanges }) => {
  return (
    <Styled.RulesEntryMarks $modified={formChanges?.modifiedFields?.includes('trace')} className="no-scroll">
      <Tooltip title="trace">
        {trace ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
      </Tooltip>
    </Styled.RulesEntryMarks>
  )
}
