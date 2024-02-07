import React, { FC } from 'react'
import { Segmented, Button } from 'antd'
import { UndoOutlined } from '@ant-design/icons'
import { THistoryAction } from 'localTypes/graph'
import { Styled } from './styled'

type TGraphControlsProps = {
  historyActions: THistoryAction[]
  revertHistoryAction: () => void
  selectedSg: string[]
  viewType: string | number
  onViewTypeChange: (value: string | number) => void
}

export const GraphControls: FC<TGraphControlsProps> = ({
  historyActions,
  revertHistoryAction,
  selectedSg,
  viewType,
  onViewTypeChange,
}) => {
  const getSegmentedOptions = () => {
    const result = [
      { label: 'High Level', value: 'High Level', disabled: false },
      { label: 'Star', value: 'Star', disabled: true },
      { label: 'Ports', value: 'Ports', disabled: true },
      { label: 'Networks', value: 'Networks', disabled: true },
      { label: 'Low Level', value: 'Low Level', disabled: true },
    ]
    if (selectedSg.length > 0) {
      result[1].disabled = false
    }
    if (selectedSg.length > 1) {
      result[2].disabled = false
      result[3].disabled = false
      result[4].disabled = false
    }
    return result
  }

  return (
    <Styled.Constrols>
      <Styled.UndoButton>
        <Button
          shape="circle"
          disabled={historyActions.length === 0}
          icon={<UndoOutlined />}
          onClick={() => revertHistoryAction()}
        />
      </Styled.UndoButton>
      <Styled.SegmentedContainer>
        <Segmented options={getSegmentedOptions()} value={viewType} onChange={onViewTypeChange} />
      </Styled.SegmentedContainer>
    </Styled.Constrols>
  )
}
