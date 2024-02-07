import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Button, Form, Input, Select, Switch, Breadcrumb, Result, Alert, Spin } from 'antd'
import type { SelectProps } from 'antd'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { getNetworks } from 'api/networks'
import { addSecurityGroup, getSecurityGroups } from 'api/securityGroups'
import { Styled } from './styled'

export const SecurityGroupAdd: FC = () => {
  const [form] = Form.useForm()
  const [networksOptions, setNetworkOptions] = useState<SelectProps['options']>()
  const [unavailableSGNames, setUnavailableSGNames] = useState<string[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [addError, setAddError] = useState<TRequestError | undefined>()
  const [success, setSuccess] = useState<boolean>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    Promise.all([getNetworks(), getSecurityGroups()])
      .then(([value1, value2]) => {
        const allNetworksName = value1.data.networks.map(({ name }) => name)
        const unavailableNetworksName = value2.data.groups.flatMap(({ networks }) => networks)
        const availableNetworks = allNetworksName.filter(el => !unavailableNetworksName.includes(el))
        setNetworkOptions(availableNetworks.map(name => ({ label: name, value: name })))
        const unavailableSGName = value2.data.groups.map(({ name }) => name)
        setUnavailableSGNames(unavailableSGName)
        setIsLoading(false)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setError({ status: error.status })
        } else {
          setError({ status: 'Error while fetching' })
        }
      })
  }, [])

  const onFinish = ({ name, defaultAction, networks, logs, trace }: TSecurityGroup) => {
    setIsLoading(true)
    setError(undefined)
    addSecurityGroup(name, defaultAction, networks, logs, trace)
      .then(() => {
        setIsLoading(false)
        setSuccess(true)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
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
    history.push('/security-groups')
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
    <>
      <Breadcrumb
        items={[
          {
            href: '/security-groups',
            title: 'Security groups',
          },
          {
            title: 'Add',
          },
        ]}
      />
      <Spacer $space={15} $samespace />
      <Card>
        <TitleWithNoTopMargin level={2}>Add a security group</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Form
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          initialValues={{ networks: [], logs: false, trace: false }}
        >
          <Styled.Container>
            <Styled.FormItem
              name="name"
              label="Name"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Please input SG name' },
                () => ({
                  validator(_, value) {
                    if (!value || !unavailableSGNames.includes(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Please enter unique SG name'))
                  },
                }),
              ]}
            >
              <Input allowClear />
            </Styled.FormItem>
            <Styled.FormItem
              name="defaultAction"
              label="Default action"
              hasFeedback
              validateTrigger="onBlur"
              rules={[{ required: true, message: 'Please choose default action' }]}
            >
              <Select
                allowClear
                placeholder="Action"
                options={[
                  { label: 'DROP', value: 'DROP' },
                  { label: 'ACCEPT', value: 'ACCEPT' },
                ]}
              />
            </Styled.FormItem>
            <Styled.FormItem name="networks" label="Networks">
              <Select mode="multiple" placeholder="Networks" options={networksOptions} />
            </Styled.FormItem>
            <Styled.FormItem valuePropName="checked" name="logs" label="Logs">
              <Switch />
            </Styled.FormItem>
            <Styled.FormItem valuePropName="checked" name="trace" label="Trace">
              <Switch />
            </Styled.FormItem>
            <Styled.ButtonFormItem>
              <Button type="primary" htmlType="submit">
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
    </>
  )
}
