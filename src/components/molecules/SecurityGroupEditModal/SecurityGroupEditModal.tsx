import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Modal, Card, Form, Select, Switch, Result, Spin } from 'antd'
import { TitleWithNoTopMargin, Spacer, SubmitButton } from 'components'
import { getSecurityGroupByName, editSecurityGroup, getSecurityGroups } from 'api/securityGroups'
import { getNetworks } from 'api/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { Styled } from './styled'

type TSecurityGroupEditModalProps = {
  externalOpenInfo: string | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<string | boolean>>
  openNotification?: (msg: string) => void
}

export const SecurityGroupEditModal: FC<TSecurityGroupEditModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
}) => {
  const [form] = Form.useForm()

  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [securityGroup, setSecurityGroup] = useState<TSecurityGroup>()
  const [networksOptions, setNetworkOptions] = useState<{ label: string; value: string }[]>()

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    if (typeof externalOpenInfo === 'string') {
      Promise.all([getSecurityGroupByName(externalOpenInfo), getNetworks(), getSecurityGroups()])
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
          setNetworkOptions(availableNetworks.map(({ name, cidr }) => ({ label: `${name} : ${cidr}`, value: name })))
          setIsLoading(false)
          form.setFieldsValue({
            defaultAction: sgResponse.data.groups[0].defaultAction,
            networks: alreadyAddedNetworks.map(({ name, cidr }) => ({ label: `${name} : ${cidr}`, value: name })),
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
    }
  }, [externalOpenInfo, form])

  const onFinish = ({
    defaultAction,
    networks,
    logs,
    trace,
  }: Omit<TSecurityGroup, 'networks'> & { networks: string[] | { value: string; label: string }[] }) => {
    setIsLoading(true)
    setError(undefined)
    if (typeof externalOpenInfo === 'string') {
      const modifiedNetworks = networks.map(el => (typeof el === 'string' ? el : el.value))
      editSecurityGroup(externalOpenInfo, defaultAction, modifiedNetworks, logs, trace)
        .then(() => {
          setIsLoading(false)
          if (openNotification) {
            openNotification('Security group edited')
          }
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
    }
  }

  return (
    <Modal
      title="Edit security groups"
      open={externalOpenInfo !== false}
      onOk={() => setExternalOpenInfo(false)}
      onCancel={() => setExternalOpenInfo(false)}
    >
      {isLoading && <Spin />}
      {error && <Result status="error" title={error.status} subTitle={error.data?.message} />}
      {!isLoading && !error && securityGroup && (
        <Card>
          <TitleWithNoTopMargin level={2}>Edit the security group: {securityGroup.name}</TitleWithNoTopMargin>
          <Spacer $space={15} $samespace />
          <Form
            form={form}
            name="control-hooks"
            onFinish={(
              values: Omit<TSecurityGroup, 'networks'> & { networks: string[] | { value: string; label: string }[] },
            ) => onFinish({ ...values })}
          >
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
        </Card>
      )}
    </Modal>
  )
}
