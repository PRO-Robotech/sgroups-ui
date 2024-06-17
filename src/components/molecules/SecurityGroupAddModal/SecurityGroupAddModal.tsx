import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Modal, Form, Input, Select, Switch, Result, Spin } from 'antd'
import { TitleWithNoTopMargin, Spacer, SubmitButton } from 'components'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { getNetworks } from 'api/networks'
import { addSecurityGroup, getSecurityGroups } from 'api/securityGroups'
import { Styled } from './styled'

type TSecurityGroupAddModalProps = {
  externalOpenInfo: boolean
  setExternalOpenInfo: Dispatch<SetStateAction<boolean>>
  openNotification?: (msg: string) => void
}

export const SecurityGroupAddModal: FC<TSecurityGroupAddModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
}) => {
  const [form] = Form.useForm()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<TRequestError | undefined>()

  const [networksOptions, setNetworkOptions] = useState<{ label: string; value: string }[]>()
  const [unavailableSGNames, setUnavailableSGNames] = useState<string[]>([])

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    Promise.all([getNetworks(), getSecurityGroups()])
      .then(([nwResponse, allSgsResponse]) => {
        const allNetworksNameAndCidrs = nwResponse.data.networks.map(({ name, network }) => ({
          name,
          cidr: network.CIDR,
        }))
        const unavailableNetworksName = allSgsResponse.data.groups.flatMap(({ networks }) => networks)
        const availableNetworks = allNetworksNameAndCidrs.filter(el => !unavailableNetworksName.includes(el.name))
        setNetworkOptions(availableNetworks.map(({ name, cidr }) => ({ label: `${name}:${cidr}`, value: name })))
        const unavailableSGName = allSgsResponse.data.groups.map(({ name }) => name)
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
        if (openNotification) {
          openNotification('Security group added')
        }
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setError({ status: error.status })
        } else {
          setError({ status: 'Error occured while adding' })
        }
      })
  }

  return (
    <Modal
      title="Add security group"
      open={externalOpenInfo}
      onOk={() => setExternalOpenInfo(false)}
      onCancel={() => setExternalOpenInfo(false)}
    >
      {isLoading && <Spin />}
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
        />
      )}
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
            <Select
              mode="multiple"
              placeholder="Networks"
              options={networksOptions}
              showSearch
              filterOption={filterOption}
            />
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
    </Modal>
  )
}
