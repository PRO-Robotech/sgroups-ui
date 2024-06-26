import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Modal, Form, Input, Typography, Radio, Select, Switch } from 'antd'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { getNetworks } from 'api/networks'
import { addSecurityGroup, getSecurityGroups } from 'api/securityGroups'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { TNetwork } from 'localTypes/networks'
import { Spacer } from 'components'
import { Styled } from './styled'

type TSecurityGroupAddModalProps = {
  externalOpenInfo: boolean
  setExternalOpenInfo: Dispatch<SetStateAction<boolean>>
  initSecurityGroups: TSecurityGroup[]
  setInitSecurityGroups: Dispatch<SetStateAction<TSecurityGroup[]>>
  nwResponse: TNetwork[]
  openNotification?: (msg: string) => void
}

export const SecurityGroupAddModal: FC<TSecurityGroupAddModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
  initSecurityGroups,
  setInitSecurityGroups,
  nwResponse,
}) => {
  const [form] = Form.useForm<TSecurityGroup>()
  const name = Form.useWatch<string>('name', form)
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

  const submit = () => {
    form
      .validateFields()
      .then(() => {
        setIsLoading(true)
        setError(undefined)
        const values: TSecurityGroup = form.getFieldsValue()
        addSecurityGroup(values.name, values.defaultAction, values.networks, values.logs, values.trace)
          .then(() => {
            setIsLoading(false)
            setError(undefined)
            setExternalOpenInfo(false)
            form.resetFields()
            if (openNotification) {
              openNotification('Security Group Added')
            }
            const enrichedWithNWNameValues = {
              ...values,
              networks: values.networks.map(nw => {
                const nwData = nwResponse.find(entry => entry.name === nw)
                return nwData ? `${nwData.name} : ${nwData.network.CIDR}` : `${nw} : null`
              }),
            }
            setInitSecurityGroups([enrichedWithNWNameValues, ...initSecurityGroups])
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
      })
      .catch(() => console.log('Validating error'))
  }

  return (
    <Modal
      title="Add Security Group"
      open={externalOpenInfo}
      onOk={() => submit()}
      onCancel={() => {
        setExternalOpenInfo(false)
        setIsLoading(false)
        setError(undefined)
        form.resetFields()
      }}
      okText="Add"
      confirmLoading={isLoading}
      okButtonProps={{
        disabled: !name || name === undefined || name.length === 0,
      }}
    >
      <Spacer $space={16} $samespace />
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={error.data ? `Code:${error.data.code}. Message: ${error.data.message}` : undefined}
        />
      )}
      <Form
        form={form}
        name="control-hooks"
        initialValues={{ networks: [], defaultAction: 'DROP', logs: false, trace: false }}
      >
        <Typography.Text>
          Name<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Styled.ResetedFormItem
          name="name"
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
          <Input allowClear size="large" placeholder="Enter name" />
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Typography.Text>
          Action<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem
          name="defaultAction"
          hasFeedback
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Please choose default action' }]}
        >
          <Radio.Group>
            <Radio value="DROP">DROP</Radio>
            <Radio value="ACCEPT">ACCEPT</Radio>
          </Radio.Group>
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Typography.Text>Network</Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem name="networks">
          <Select
            mode="multiple"
            placeholder="Select network"
            options={networksOptions}
            showSearch
            filterOption={filterOption}
            size="large"
          />
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Styled.ResetedFormItem valuePropName="checked" name="logs" label="Logs" colon={false}>
          <Switch />
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Styled.ResetedFormItem valuePropName="checked" name="trace" label="Trace" colon={false}>
          <Switch />
        </Styled.ResetedFormItem>
      </Form>
    </Modal>
  )
}
