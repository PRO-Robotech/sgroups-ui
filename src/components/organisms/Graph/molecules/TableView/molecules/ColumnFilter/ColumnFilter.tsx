/* eslint-disable camelcase */
import React, { FC, Dispatch, SetStateAction } from 'react'
import { Select } from 'antd'
import { Styled } from './styled'

type TColumnFilterProps = {
  onHiddenColsChange: Dispatch<SetStateAction<string[] | undefined>>
}

export const ColumnFilter: FC<TColumnFilterProps> = ({ onHiddenColsChange }) => (
  <Styled.SelectContainer>
    <Select
      onChange={values => onHiddenColsChange(values)}
      allowClear
      mode="multiple"
      placeholder="Hidden cols"
      options={[
        { label: 'src ip', value: 'src_ip' },
        { label: 'src port', value: 'src_port' },
        { label: 'dst ip', value: 'dst_ip' },
        { label: 'dst port', value: 'dst_port' },
        { label: 'protocol', value: 'protocol' },
        { label: 'from', value: 'from' },
        { label: 'to', value: 'to' },
      ]}
    />
  </Styled.SelectContainer>
)
