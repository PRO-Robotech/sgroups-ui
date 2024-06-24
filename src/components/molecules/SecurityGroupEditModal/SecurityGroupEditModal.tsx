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

type TSecurityGroupEditModalProps = {
  externalOpenInfo: TSecurityGroup | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<TSecurityGroup | boolean>>
  initSecurityGroups: TSecurityGroup[]
  setInitSecurityGroups: Dispatch<SetStateAction<TSecurityGroup[]>>
  nwResponse: TNetwork[]
  openNotification?: (msg: string) => void
}

export const SecurityGroupEditModal: FC<TSecurityGroupEditModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
  initSecurityGroups,
  setInitSecurityGroups,
  nwResponse,
}) => {
  const [form] = Form.useForm<TSecurityGroup>()
  const defaultAction = Form.useWatch<string>('defaultAction', form)
  const networks = Form.useWatch<string[]>('networks', form)
  const logs = Form.useWatch<boolean>('logs', form)
  const trace = Form.useWatch<boolean>('trace', form)
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [networksOptions, setNetworkOptions] = useState<{ label: string; value: string }[]>()

  useEffect(() => {
    if (typeof externalOpenInfo !== 'boolean') {
      form.setFieldsValue(externalOpenInfo)
    }
  }, [externalOpenInfo, form])

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
        addSecurityGroup(
          values.name,
          values.defaultAction,
          values.networks.map(el => el.split(' : ')[0]),
          values.logs,
          values.trace,
        )
          .then(() => {
            setIsLoading(false)
            setError(undefined)
            setExternalOpenInfo(false)
            form.resetFields()
            if (openNotification) {
              openNotification('Changes Saved')
            }
            const newSecurityGroups = [...initSecurityGroups]
            const index = newSecurityGroups.findIndex(el => el.name === values.name)
            const enrichedWithNWNameValues = {
              ...values,
              networks: values.networks.map(nw => {
                const nwData = nwResponse.find(entry => entry.name === nw)
                return nwData ? `${nwData.name} : ${nwData.network.CIDR}` : `${nw} : null`
              }),
            }
            newSecurityGroups[index] = { ...newSecurityGroups[index], ...enrichedWithNWNameValues }
            setInitSecurityGroups([...newSecurityGroups])
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
      .catch(() => setError({ status: 'Error while validating' }))
  }

  if (typeof externalOpenInfo === 'boolean') {
    return null
  }

  return (
    <Modal
      title="Edit Security Group"
      open={typeof externalOpenInfo !== 'boolean'}
      onOk={() => submit()}
      onCancel={() => {
        setExternalOpenInfo(false)
        setIsLoading(false)
        setError(undefined)
        form.resetFields()
      }}
      okText="Save"
      confirmLoading={isLoading}
      okButtonProps={{
        disabled:
          defaultAction === externalOpenInfo.defaultAction &&
          logs === externalOpenInfo.logs &&
          trace === externalOpenInfo.trace &&
          JSON.stringify(networks.sort()) === JSON.stringify(externalOpenInfo.networks.sort()),
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
      <Form form={form} name="control-hooks" initialValues={{ networks: [], logs: false, trace: false }}>
        <Typography.Text>
          Name<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Styled.ResetedFormItem name="name" hasFeedback validateTrigger="onBlur">
          <Input disabled allowClear size="large" placeholder="Enter name" />
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
        <Styled.ResetedFormItem name="logs" label="Logs" colon={false}>
          <Switch />
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Styled.ResetedFormItem name="trace" label="Trace" colon={false}>
          <Switch />
        </Styled.ResetedFormItem>
      </Form>
    </Modal>
  )
}
