import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Form, Select } from 'antd'
import { TitleWithNoTopMargin } from 'components'
import { filterSgName } from 'utils/filterSgName'
import { TFieldData } from './types'
import { Styled } from './styled'

type TSelectMainSGProps = {
  sgNames: string[]
  onSelectMainSg: Dispatch<SetStateAction<string | undefined>>
  centerSg?: string
}

export const SelectMainSG: FC<TSelectMainSGProps> = ({ sgNames, onSelectMainSg, centerSg }) => {
  const [curValues, setCurValues] = useState<TFieldData[]>([{ name: 'name', value: undefined }])

  useEffect(() => {
    if (!centerSg) {
      setCurValues([{ name: 'name', value: undefined }])
    }
  }, [centerSg])

  return (
    <Styled.GroupRulesNode>
      <TitleWithNoTopMargin level={4}>Main SG</TitleWithNoTopMargin>
      <Form
        fields={curValues}
        onFieldsChange={(_, allFields) => {
          setCurValues(allFields)
        }}
      >
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
      </Form>
    </Styled.GroupRulesNode>
  )
}
