import React, { FC, useEffect } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormSgSgIeRule } from 'localTypes/rules'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TEditSgSgIePopoverProps = {
  sgNames: string[]
  values: TFormSgSgIeRule
  hide: () => void
  remove: () => void
  edit: (values: TFormSgSgIeRule) => void
  isDisabled?: boolean
}

export const EditSgSgIePopover: FC<TEditSgSgIePopoverProps> = ({ sgNames, values, hide, remove, edit, isDisabled }) => {
  const [addForm] = Form.useForm()

  useEffect(() => {
    addForm.setFieldsValue(values)
  }, [values, addForm])

  return (
    <Form form={addForm} onFinish={(values: TFormSgSgIeRule) => edit(values)}>
      <Styled.FormItem label="Groups" name={['sg']} rules={[{ required: true, message: 'Missing SG Names' }]}>
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
