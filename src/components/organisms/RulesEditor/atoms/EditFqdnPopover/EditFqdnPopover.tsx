import React, { FC, useEffect } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormFqdnRule } from 'localTypes/rules'
import { Styled } from './styled'

type TEditFqdnPopoverProps = {
  values: TFormFqdnRule
  hide: () => void
  remove: () => void
  edit: (values: TFormFqdnRule) => void
  isDisabled?: boolean
}

export const EditFqdnPopover: FC<TEditFqdnPopoverProps> = ({ values, hide, remove, edit, isDisabled }) => {
  const [addForm] = Form.useForm()

  useEffect(() => {
    addForm.setFieldsValue(values)
  }, [values, addForm])

  return (
    <Form form={addForm} onFinish={(values: TFormFqdnRule) => edit(values)}>
      <Styled.FormItem label="Groups" name={['fqdns']} rules={[{ required: true, message: 'Missing FQDNs' }]}>
        <Select
          mode="tags"
          showSearch
          placeholder="Select FQDNs"
          optionFilterProp="children"
          allowClear
          tokenSeparators={[',', ' ']}
          getPopupContainer={node => node.parentNode}
          disabled={isDisabled}
        />
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
