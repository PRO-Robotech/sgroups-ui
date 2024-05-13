import React, { FC } from 'react'
import { Button, Form, Input, InputNumber, Select, Switch } from 'antd'
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormCidrSgRule } from 'localTypes/rules'
import { Styled } from './styled'

type TAddCidrSgPopoverProps = {
  hide: () => void
  addNew: (values: TFormCidrSgRule) => void
}

export const AddCidrSgPopover: FC<TAddCidrSgPopoverProps> = ({ hide, addNew }) => {
  const [addForm] = Form.useForm()

  return (
    <Form
      form={addForm}
      onFinish={(values: TFormCidrSgRule) => {
        addNew(values)
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
      <Styled.FormItem label="Ports Source" name="portsSource">
        <Input placeholder="Ports Source" />
      </Styled.FormItem>
      <Styled.FormItem label="Ports Destination" name="portsDestination">
        <Input placeholder="Ports Destination" />
      </Styled.FormItem>
      <Styled.FormItem
        name="transport"
        label="Transport"
        hasFeedback
        validateTrigger="onBlur"
        rules={[{ required: true, message: 'Please choose transport' }]}
      >
        <Select
          allowClear
          placeholder="Transport"
          options={[
            { label: 'TCP', value: 'TCP' },
            { label: 'UDP', value: 'UDP' },
          ]}
          getPopupContainer={node => node.parentNode}
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
      <Styled.FormItem name="prioritySome" label="Priority" hasFeedback validateTrigger="onBlur">
        <InputNumber placeholder="priority.some" />
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
