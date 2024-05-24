import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Form, Select, Switch, Breadcrumb, Result, Spin, Alert } from 'antd'
import type { SelectProps } from 'antd'
import { TitleWithNoTopMargin, Spacer, SubmitButton } from 'components'
import { getSecurityGroupByName, editSecurityGroup, getSecurityGroups } from 'api/securityGroups'
import { getNetworks } from 'api/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { Styled } from './styled'

type TSecurityGroupEditProps = {
  id: string
}

export const SecurityGroupEdit: FC<TSecurityGroupEditProps> = ({ id }) => {
  const [form] = Form.useForm()
  const history = useHistory()
  const [securityGroup, setSecurityGroup] = useState<TSecurityGroup>()
  const [networksOptions, setNetworkOptions] = useState<SelectProps['options']>()
  const [error, setError] = useState<TRequestError | undefined>()
  const [editError, setEditError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [success, setSuccess] = useState<boolean>()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    Promise.all([getSecurityGroupByName(id), getNetworks(), getSecurityGroups()])
      .then(([sgResponse, nwResponse, allSgsResponse]) => {
        setSecurityGroup(sgResponse.data.groups[0])
        const allNetworksNameAndCidrs = nwResponse.data.networks.map(({ name, network }) => ({
          name,
          cidr: network.CIDR,
        }))
        const alreadyAddedNetworks = sgResponse.data.groups[0].networks.map(el => ({
          name: el,
          cidr: nwResponse.data.networks.find(nw => nw.name === el)?.network.CIDR || 'null',
        }))
        const unavailableNetworksName = allSgsResponse.data.groups.flatMap(({ networks }) => networks)
        const availableNetworks = [
          ...alreadyAddedNetworks,
          ...allNetworksNameAndCidrs.filter(el => !unavailableNetworksName.includes(el.name)),
        ]
        setNetworkOptions(availableNetworks.map(({ name, cidr }) => ({ label: `${name}:${cidr}`, value: name })))
        setIsLoading(false)
        form.setFieldsValue({
          defaultAction: sgResponse.data.groups[0].defaultAction,
          networks: alreadyAddedNetworks.map(({ name, cidr }) => ({ label: `${name}:${cidr}`, value: name })),
          logs: sgResponse.data.groups[0].logs,
          trace: sgResponse.data.groups[0].trace,
        })
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
  }, [id, form])

  const onFinish = ({ defaultAction, networks, logs, trace }: TSecurityGroup) => {
    setIsLoading(true)
    setError(undefined)
    editSecurityGroup(id, defaultAction, networks, logs, trace)
      .then(() => {
        setIsLoading(false)
        setSuccess(true)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setEditError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setEditError({ status: error.status })
        } else {
          setEditError({ status: 'Error while fetching' })
        }
      })
  }

  if (success) {
    history.push(`/security-groups/${id}`)
  }

  if (error) {
    return <Result status="error" title={error.status} subTitle={error.data?.message} />
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
            title: 'Edit',
          },
        ]}
      />
      <Spacer $space={15} $samespace />
      {securityGroup && (
        <Card>
          <TitleWithNoTopMargin level={2}>Edit the security group: {securityGroup.name}</TitleWithNoTopMargin>
          <Spacer $space={15} $samespace />
          <Form form={form} name="control-hooks" onFinish={onFinish}>
            <Styled.Container>
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
                <SubmitButton form={form}>Submit</SubmitButton>
              </Styled.ButtonFormItem>
            </Styled.Container>
          </Form>
          {editError && (
            <Alert
              message={editError.status}
              description={`Code:${editError.data?.code}. Message: ${editError.data?.message}`}
              type="error"
            />
          )}
        </Card>
      )}
    </>
  )
}
