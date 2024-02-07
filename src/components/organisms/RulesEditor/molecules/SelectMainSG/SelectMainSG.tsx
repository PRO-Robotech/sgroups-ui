import React, { FC, Dispatch, SetStateAction } from 'react'
import { Select } from 'antd'
import { TitleWithNoTopMargin } from 'components'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TSelectMainSGProps = {
  sgNames: string[]
  onSelectMainSg: Dispatch<SetStateAction<string | undefined>>
}

export const SelectMainSG: FC<TSelectMainSGProps> = ({ sgNames, onSelectMainSg }) => (
  <Styled.GroupRulesNode>
    <TitleWithNoTopMargin level={4}>Main SG</TitleWithNoTopMargin>
    <Styled.FormItem
      name="name"
      hasFeedback
      validateTrigger="onBlur"
      rules={[{ required: true, message: 'Please input SG name' }]}
    >
      <Select
        showSearch
        allowClear
        onSelect={onSelectMainSg}
        onClear={() => onSelectMainSg(undefined)}
        placeholder="Select sg"
        optionFilterProp="children"
        filterOption={filterSgName}
        options={sgNames.map(el => ({
          value: el,
          label: el,
        }))}
        autoFocus
      />
    </Styled.FormItem>
  </Styled.GroupRulesNode>
)
