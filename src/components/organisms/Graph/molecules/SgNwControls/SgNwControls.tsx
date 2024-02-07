import React, { FC } from 'react'
import { Form, Input } from 'antd'
import { Styled } from './styled'

type TSgNwControlsProps = {
  selectedSg: string[]
  onSelectSg: (values: string[]) => void
  onSelectNW: (nw?: string) => void
  selectedNW?: string
}

export const SgNwControls: FC<TSgNwControlsProps> = ({ selectedSg, onSelectSg, onSelectNW, selectedNW }) => (
  <Form>
    <Styled.Container>
      <Styled.FormItem label="Group 1:">
        <Input
          value={selectedSg[0]}
          allowClear
          onChange={({ target }) => onSelectSg(target.value ? [target.value, selectedSg[1]] : [selectedSg[1]])}
        />
      </Styled.FormItem>
      <Styled.FormItem label="Group 2:">
        <Input
          value={selectedSg[1]}
          disabled={selectedSg.length === 0}
          allowClear
          onChange={({ target }) => onSelectSg(target.value ? [selectedSg[0], target.value] : [selectedSg[0]])}
        />
      </Styled.FormItem>
      <Styled.FormItem label="Network:">
        <Input
          value={selectedNW}
          allowClear
          disabled={selectedSg.length !== 2}
          onChange={({ target }) => {
            onSelectNW(target.value)
          }}
        />
      </Styled.FormItem>
    </Styled.Container>
  </Form>
)
