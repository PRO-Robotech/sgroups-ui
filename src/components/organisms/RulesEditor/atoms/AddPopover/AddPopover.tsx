/* eslint-disable max-lines-per-function */
import React, { ReactElement } from 'react'
import { Button, Form, Input, Select, Switch } from 'antd'
import { PlusCircleOutlined, CloseOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TAddPopoverProps<T> = {
  hide: () => void
  addNew: (values: T) => void
  isSg?: boolean
  isFqdn?: boolean
  isCidr?: boolean
  isPorts?: boolean
  isTransport?: boolean
  isIcmp?: boolean
  isTrace?: boolean
  defaultPrioritySome?: string
}

export const AddPopover = <T,>({
  hide,
  addNew,
  isSg,
  isFqdn,
  isCidr,
  isPorts,
  isTransport,
  isIcmp,
  isTrace,
  defaultPrioritySome,
}: TAddPopoverProps<T>): ReactElement | null => {
  const [addForm] = Form.useForm()
  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)

  return (
    <Form
      form={addForm}
      onFinish={(values: T) => {
        addNew(values)
        addForm.resetFields()
      }}
    >
      {isSg && (
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
          />
        </Styled.FormItem>
      )}
      {isFqdn && (
        <Styled.FormItem
          label="FQDN"
          name={['fqdn']}
          rules={[
            { required: true, message: 'Missing FQDN' },
            {
              pattern:
                /(?=^.{1,253}$)(^(((?!-)[a-zA-Z0-9-]{1,63}(?<!-))|((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63})$)/,
              message: 'Please enter a valid FQDN',
            },
          ]}
        >
          <Input placeholder="FQDN" />
        </Styled.FormItem>
      )}
      {isCidr && (
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
      )}
      {isPorts && (
        <Styled.PortsEditContainer>
          <Form.List name="ports">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Styled.PortFormItemsContainer key={key}>
                    <Styled.FormItem {...restField} name={[name, 's']} label="Source">
                      <Input placeholder="Port source" />
                    </Styled.FormItem>
                    <Styled.FormItem {...restField} name={[name, 'd']} label="Destination">
                      <Input placeholder="Port destination" />
                    </Styled.FormItem>
                    <Button type="dashed" onClick={() => remove(name)} block icon={<MinusOutlined />}>
                      Remove ports
                    </Button>
                  </Styled.PortFormItemsContainer>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add ports
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Styled.PortsEditContainer>
      )}
      {isTransport && (
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
      )}
      {isIcmp && (
        <>
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
        </>
      )}
      <Styled.FormItem valuePropName="checked" name="logs" label="Logs">
        <Switch />
      </Styled.FormItem>
      {isTrace && (
        <Styled.FormItem valuePropName="checked" name="trace" label="Trace">
          <Switch />
        </Styled.FormItem>
      )}
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
              if (value === undefined) {
                return Promise.resolve()
              }
              const numberedValue = Number(value)
              if (Number.isNaN(numberedValue) || numberedValue > 32767 || numberedValue < -32768) {
                return Promise.reject(new Error('Not in valid range'))
              }
              return Promise.resolve()
            },
          }),
        ]}
      >
        <Input placeholder={defaultPrioritySome || 'priority.some'} />
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
