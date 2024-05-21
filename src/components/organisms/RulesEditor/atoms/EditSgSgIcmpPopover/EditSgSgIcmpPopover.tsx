import React, { FC, useEffect } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined } from '@ant-design/icons'
import { TFormSgSgIcmpRule } from 'localTypes/rules'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TEditSgSgIcmpPopoverProps = {
  values: TFormSgSgIcmpRule
  hide: () => void
  remove: () => void
  edit: (values: TFormSgSgIcmpRule) => void
  isDisabled?: boolean
}

export const EditSgSgIcmpPopover: FC<TEditSgSgIcmpPopoverProps> = ({ values, hide, remove, edit, isDisabled }) => {
  const [addForm] = Form.useForm()
  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)

  useEffect(() => {
    addForm.setFieldsValue(values)
  }, [values, addForm])

  return (
    <Form
      form={addForm}
      onFinish={(values: Omit<TFormSgSgIcmpRule, 'prioritySome'> & { prioritySome?: string }) =>
        edit({
          ...values,
          prioritySome: values.prioritySome && values.prioritySome.length > 0 ? Number(values.prioritySome) : undefined,
        })
      }
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
          disabled={isDisabled}
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
          disabled={isDisabled}
        />
      </Styled.FormItem>
      <Styled.FormItem
        label="Types"
        name="types"
        tooltip="Separator: space / coma"
        rules={[
          { required: true, message: 'Please choose types' },
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
          disabled={isDisabled}
          dropdownStyle={{ display: 'none' }}
          suffixIcon={null}
        />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="logs" label="Logs">
        <Switch disabled={isDisabled} />
      </Styled.FormItem>
      <Styled.FormItem valuePropName="checked" name="trace" label="trace">
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
