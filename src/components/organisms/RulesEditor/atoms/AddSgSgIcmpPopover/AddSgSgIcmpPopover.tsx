import React, { FC } from 'react'
import { Button, Form, Select, Switch } from 'antd'
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormSgSgIcmpRule } from 'localTypes/rules'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TAddSgSgIcmpPopoverProps = {
  sgNames: string[]
  hide: () => void
  addNew: (values: TFormSgSgIcmpRule) => void
}

export const AddSgSgIcmpPopover: FC<TAddSgSgIcmpPopoverProps> = ({ sgNames, hide, addNew }) => {
  const [addForm] = Form.useForm()

  return (
    <Form
      form={addForm}
      onFinish={(values: TFormSgSgIcmpRule) => {
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
        name="ICMPv"
        label="ICMPv"
        hasFeedback
        validateTrigger="onBlur"
        rules={[{ required: true, message: 'Please choose ICMPv' }]}
      >
        <Select
          allowClear
          placeholder="ICMPv"
          options={[
            { label: 'ICMPv6', value: 'ICMPv6' },
            { label: 'ICMPv4', value: 'ICMPv4' },
          ]}
          getPopupContainer={node => node.parentNode}
        />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="logs" label="Logs">
        <Switch />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="trace" label="trace">
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
