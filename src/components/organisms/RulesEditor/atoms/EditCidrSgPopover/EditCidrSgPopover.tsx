import React, { FC, useEffect } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormCidrSgRule, TTraffic } from 'localTypes/rules'
import { Styled } from './styled'

type TEditCidrSgPopoverProps = {
  values: TFormCidrSgRule
  hide: () => void
  remove: () => void
  edit: (values: TFormCidrSgRule) => void
  defaultTraffic: TTraffic
}

export const EditCidrSgPopover: FC<TEditCidrSgPopoverProps> = ({ values, hide, remove, edit, defaultTraffic }) => {
  const [addForm] = Form.useForm()

  useEffect(() => {
    addForm.setFieldsValue(values)
  }, [values, addForm])

  return (
    <Form form={addForm} onFinish={(values: TFormCidrSgRule) => edit(values)}>
      <Styled.FormItem label="CIDR" name="cidr" rules={[{ required: true, message: 'Missing CIDR' }]}>
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
      <Styled.FormItem name="traffic" label="Traffic" hasFeedback validateTrigger="onBlur">
        <Select
          allowClear
          placeholder="Traffic"
          options={[
            { label: 'Ingress', value: 'Ingress' },
            { label: 'Egress', value: 'Egress' },
          ]}
          getPopupContainer={node => node.parentNode}
          defaultValue={defaultTraffic}
          disabled
        />
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
          >
            Remove
          </Button>
        </Styled.ButtonWithRightMargin>
        <Button type="primary" block icon={<PlusCircleOutlined />} htmlType="submit">
          Save
        </Button>
      </Styled.ButtonsContainer>
    </Form>
  )
}
