import React, { FC } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormSgSgRule } from 'localTypes/rules'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TAddSgSgPopoverProps = {
  hide: () => void
  addNew: (values: TFormSgSgRule) => void
}

export const AddSgSgPopover: FC<TAddSgSgPopoverProps> = ({ hide, addNew }) => {
  const [addForm] = Form.useForm()
  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)

  return (
    <Form
      form={addForm}
      onFinish={(values: Omit<TFormSgSgRule, 'prioritySome'> & { prioritySome?: string }) => {
        addNew({
          ...values,
          prioritySome: values.prioritySome && values.prioritySome.length > 0 ? Number(values.prioritySome) : undefined,
        })
        addForm.resetFields()
      }}
    >
      <Styled.FormItem label="Groups" name={['sg']} rules={[{ required: true, message: 'Missing SG Names' }]}>
        <Select
          showSearch
          placeholder="Select SGs"
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
