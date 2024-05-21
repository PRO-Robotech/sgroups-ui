import React, { FC, useEffect } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormSgCidrRule } from 'localTypes/rules'
import { Styled } from './styled'

type TEditSgCidrPopoverProps = {
  values: TFormSgCidrRule
  hide: () => void
  remove: () => void
  edit: (values: TFormSgCidrRule) => void
  isDisabled?: boolean
}

export const EditSgCidrPopover: FC<TEditSgCidrPopoverProps> = ({ values, hide, remove, edit, isDisabled }) => {
  const [addForm] = Form.useForm()

  useEffect(() => {
    addForm.setFieldsValue(values)
  }, [values, addForm])

  return (
    <Form
      form={addForm}
      onFinish={(values: Omit<TFormSgCidrRule, 'prioritySome'> & { prioritySome?: string }) =>
        edit({
          ...values,
          prioritySome: values.prioritySome && values.prioritySome.length > 0 ? Number(values.prioritySome) : undefined,
        })
      }
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
        <Input placeholder="CIDR" disabled={isDisabled} />
      </Styled.FormItem>
      <Styled.FormItem label="Ports Source" name="portsSource">
        <Input placeholder="Ports Source" disabled={isDisabled} />
      </Styled.FormItem>
      <Styled.FormItem label="Ports Destination" name="portsDestination">
        <Input placeholder="Ports Destination" disabled={isDisabled} />
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
          disabled={isDisabled}
        />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="logs" label="Logs">
        <Switch disabled={isDisabled} />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="trace" label="Trace">
        <Switch disabled={isDisabled} />
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
          <Button type="dashed" block icon={<CloseOutlined />} onClick={hide}>
            Cancel
          </Button>
        </Styled.ButtonWithRightMargin>
        <Styled.ButtonWithRightMargin>
          <Button
            type="default"
            block
            icon={<MinusCircleOutlined />}
            onClick={() => {
              remove()
              hide()
            }}
            disabled={isDisabled}
          >
            Remove
          </Button>
        </Styled.ButtonWithRightMargin>
        <Button type="primary" block icon={<PlusCircleOutlined />} htmlType="submit" disabled={isDisabled}>
          Save
        </Button>
      </Styled.ButtonsContainer>
    </Form>
  )
}
