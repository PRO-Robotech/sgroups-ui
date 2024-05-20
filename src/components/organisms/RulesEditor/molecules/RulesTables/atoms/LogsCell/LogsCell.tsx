import React, { FC } from 'react'
import { Tooltip } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormChanges } from 'localTypes/rules'
import { Styled } from '../../styled'

type TLogsCellProps = {
  logs: boolean
  formChanges?: TFormChanges
}

export const LogsCell: FC<TLogsCellProps> = ({ logs, formChanges }) => {
  return (
    <Styled.RulesEntryMarks $modified={formChanges?.modifiedFields?.includes('logs')} className="no-scroll">
      <Tooltip title="Logs">
        {logs ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
      </Tooltip>
    </Styled.RulesEntryMarks>
  )
}
