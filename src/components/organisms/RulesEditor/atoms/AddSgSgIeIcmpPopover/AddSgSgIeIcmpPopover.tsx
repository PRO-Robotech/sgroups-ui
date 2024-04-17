import React, { FC } from 'react'
import { Button, Form, Select, Switch } from 'antd'
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormSgSgIeIcmpRule } from 'localTypes/rules'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TAddSgSgIeIcmpPopoverProps = {
  sgNames: string[]
  hide: () => void
  addNew: (values: TFormSgSgIeIcmpRule) => void
}

export const AddSgSgIeIcmpPopover: FC<TAddSgSgIeIcmpPopoverProps> = ({ sgNames, hide, addNew }) => {
  const [addForm] = Form.useForm()

  return (
    <Form
      form={addForm}
      onFinish={(values: TFormSgSgIeIcmpRule) => {
        addNew(values)
        addForm.resetFields()
      }}
    >
      <Styled.FormItem label="Groups" name={['sg']} rules={[{ required: true, message: 'Missing SG Name' }]}>
        <Select
          showSearch
          placeholder="Select SG"
          optionFilterProp="children"
          allowClear
          filterOption={filterSgName}
          options={sgNames.map(el => ({
            value: el,
            label: el,
          }))}
          getPopupContainer={node => node.parentNode}
        />
      </Styled.FormItem>
      <Styled.FormItem
        name="IPv"
        label="IPv"
        hasFeedback
        validateTrigger="onBlur"
        rules={[{ required: true, message: 'Please choose IPv' }]}
      >
        <Select
          allowClear
          placeholder="IPv"
          options={[
            { label: 'IPv6', value: 'IPv6' },
            { label: 'IPv4', value: 'IPv4' },
          ]}
          getPopupContainer={node => node.parentNode}
        />
      </Styled.FormItem>
      <Styled.FormItem
        label="Types"
        name="types"
        tooltip="Separator: space / coma"
        rules={[
          { required: true, message: 'Please choose type' },
          () => ({
            validator(_, value: string[]) {
              if (value.some(el => /^\b(?:1\d{2}|2[0-4]\d|[1-9]?\d|25[0-5])\b$/.test(el) === false)) {
                return Promise.reject(new Error('Please enter valid type'))
              }
              return Promise.resolve()
            },
          }),
        ]}
      >
        <Select
          mode="tags"
          showSearch
          placeholder="Select types"
          optionFilterProp="children"
          allowClear
          tokenSeparators={[',', ' ']}
          getPopupContainer={node => node.parentNode}
          dropdownStyle={{ display: 'none' }}
          suffixIcon={null}
        />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="logs" label="Logs">
        <Switch />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="trace" label="Trace">
        <Switch />
      </Styled.FormItem>
      <Styled.ButtonsContainer>
        <Styled.ButtonWithRightMargin>
          <Button
            type="dashed"
            block
            icon={<CloseOutlined />}
            onClick={() => {
              hide()
              addForm.resetFields()
            }}
          >
            Cancel
          </Button>
        </Styled.ButtonWithRightMargin>
        <Button type="primary" block icon={<PlusCircleOutlined />} htmlType="submit">
          Add
        </Button>
      </Styled.ButtonsContainer>
    </Form>
  )
}
