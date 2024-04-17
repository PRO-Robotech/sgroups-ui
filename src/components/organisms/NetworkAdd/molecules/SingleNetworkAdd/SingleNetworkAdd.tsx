import React, { FC } from 'react'
import { Card, Form, Input, Button } from 'antd'
import { Spacer } from 'components'
import { TNetworkForm } from 'localTypes/networks'
import { Styled } from './styled'

type TSingleNetworkAdd = {
  onFormChange: (values: Pick<TNetworkForm, 'name' | 'CIDR'>, validateResult: boolean) => void
  removeNwCard: () => void
  isDeleteButtonDisabled: boolean
}

export const SingleNetworkAdd: FC<TSingleNetworkAdd> = ({ onFormChange, removeNwCard, isDeleteButtonDisabled }) => {
  const [form] = Form.useForm()

  return (
    <Card>
      <Spacer $space={15} $samespace />
      <Form
        form={form}
        name="control-hooks"
        onValuesChange={(_, allValues) => {
          form
            .validateFields()
            .then(() => onFormChange(allValues, true))
            .catch(() => onFormChange(allValues, false))
        }}
      >
        <Styled.Container>
          <Styled.FormItem
            name="name"
            label="Name"
            hasFeedback
            validateTrigger="onBlur"
            rules={[{ required: true, message: 'Please input network name' }]}
          >
            <Input allowClear />
          </Styled.FormItem>
          <Styled.FormItem
            name="CIDR"
            label="CIDR"
            hasFeedback
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                pattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
                message: 'Please input valid CIDR',
              },
            ]}
          >
            <Input allowClear />
          </Styled.FormItem>
          <Styled.ButtonFormItem>
            <Button type="dashed" onClick={removeNwCard} disabled={isDeleteButtonDisabled}>
              Delete
            </Button>
          </Styled.ButtonFormItem>
        </Styled.Container>
      </Form>
    </Card>
  )
}
