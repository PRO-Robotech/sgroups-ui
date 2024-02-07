import React, { FC, Dispatch, SetStateAction, useState } from 'react'
import { AxiosError } from 'axios'
import { Card, Button, Form, Input, Result, Alert, Spin } from 'antd'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { addNetwork } from 'api/networks'
import { Styled } from './styled'

type TSingleNetworkAdd = {
  successCb: () => void
  isSubmitBlocked: boolean
  setSubmitBlocked: Dispatch<SetStateAction<boolean>>
}

export const SingleNetworkAdd: FC<TSingleNetworkAdd> = ({ successCb, isSubmitBlocked, setSubmitBlocked }) => {
  const [form] = Form.useForm()
  const [error, setError] = useState<TRequestError | undefined>()
  const [addError, setAddError] = useState<TRequestError | undefined>()
  const [success, setSuccess] = useState<boolean>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onFinish = ({ name, cidr }: { name: string; cidr: string }) => {
    setIsLoading(true)
    setSubmitBlocked(true)
    setError(undefined)
    addNetwork(name, cidr)
      .then(() => {
        setIsLoading(false)
        setSubmitBlocked(false)
        setSuccess(true)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        setSubmitBlocked(false)
        if (error.response) {
          setAddError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setAddError({ status: error.status })
        } else {
          setAddError({ status: 'Error occured while adding' })
        }
      })
  }

  if (success) {
    successCb()
  }

  if (error) {
    return (
      <Result
        status="error"
        title={error.status}
        subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
      />
    )
  }
  if (isLoading) {
    return <Spin />
  }

  return (
    <Card>
      <TitleWithNoTopMargin level={2}>Add a network</TitleWithNoTopMargin>
      <Spacer $space={15} $samespace />
      <Form form={form} name="control-hooks" onFinish={onFinish}>
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
            name="cidr"
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
            <Button type="primary" htmlType="submit" disabled={isSubmitBlocked}>
              Submit
            </Button>
          </Styled.ButtonFormItem>
        </Styled.Container>
      </Form>
      {addError && (
        <Alert
          message={addError.status}
          description={`Code:${addError.data?.code}. Message: ${addError.data?.message}`}
          type="error"
        />
      )}
    </Card>
  )
}
