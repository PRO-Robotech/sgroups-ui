import React, { FC } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormCidrSgIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

type TAddCidrSgIcmpPopoverProps = {
  hide: () => void
  addNew: (values: TFormCidrSgIcmpRule) => void
}

export const AddCidrSgIcmpPopover: FC<TAddCidrSgIcmpPopoverProps> = ({ hide, addNew }) => {
  const [addForm] = Form.useForm()

  return (
    <Form
      form={addForm}
      onFinish={(values: TFormCidrSgIcmpRule) => {
        addNew({ ...values, prioritySome: Number(values.prioritySome) })
        addForm.resetFields()
      }}
    >
      <Styled.FormItem
        label="CIDR"
        name="cidr"
        rules={[
          { required: true, message: 'Missing CIDR' },
          {
            required: true,
            pattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
            message: 'Please input valid CIDR',
          },
        ]}
      >
        <Input placeholder="CIDR" />
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
      <Styled.FormItem
        name="action"
        label="Action"
        hasFeedback
        validateTrigger="onBlur"
        rules={[{ required: true, message: 'Please choose action' }]}
      >
        <Select
          allowClear
          placeholder="Action"
          options={[
            { label: 'ACCEPT', value: 'ACCEPT' },
            { label: 'DROP', value: 'DROP' },
          ]}
          getPopupContainer={node => node.parentNode}
        />
      </Styled.FormItem>
      <Styled.FormItem
        name="prioritySome"
        label="Priority"
        hasFeedback
        validateTrigger="onBlur"
        rules={[
          {
            pattern: /^[-0-9]*$/,
            message: 'Please enter a valid priority',
          },
          () => ({
            validator(_, value: string) {
              const numberedValue = Number(value)
              if (numberedValue > 32767 || numberedValue < -32768) {
                return Promise.reject(new Error('Not in valid range'))
              }
              return Promise.resolve()
            },
          }),
        ]}
      >
        <Input placeholder="priority.some" />
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
