/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Modal, Form, Input, Typography, Select } from 'antd'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { editNetwork } from 'api/networks'
import { addSecurityGroup } from 'api/securityGroups'
import { isCidrValid } from 'utils/isCidrValid'
import { TNetworkFormWithSg, TNetworkWithSg } from 'localTypes/networks'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { Spacer } from 'components'
import { Styled } from './styled'

type TNetworkEditModalProps = {
  externalOpenInfo: TNetworkFormWithSg | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<TNetworkFormWithSg | boolean>>
  initNetworks: TNetworkWithSg[]
  setInitNetworks: Dispatch<SetStateAction<TNetworkWithSg[]>>
  options: TSecurityGroup[]
  openNotification?: (msg: string) => void
}

export const NetworkEditModal: FC<TNetworkEditModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
  initNetworks,
  setInitNetworks,
  options,
}) => {
  const [form] = Form.useForm<TNetworkFormWithSg>()
  const CIDR = Form.useWatch<string>('CIDR', form)
  const securityGroup = Form.useWatch<string>('securityGroup', form)
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (typeof externalOpenInfo !== 'boolean') {
      form.setFieldsValue({
        name: externalOpenInfo.name,
        CIDR: externalOpenInfo.CIDR,
        securityGroup: externalOpenInfo.securityGroup,
      })
    }
  }, [externalOpenInfo, form])

  const submit = () => {
    form
      .validateFields()
      .then(() => {
        const formName = form.getFieldValue('name')
        const formCidr = form.getFieldValue('CIDR')
        setIsLoading(true)
        setError(undefined)
        editNetwork(formName, formCidr)
          .then(() => {
            /* API moment */
            /* check if sg has been changed */
            if (typeof externalOpenInfo !== 'boolean' && securityGroup !== externalOpenInfo.securityGroup) {
              /* if initial sg existed, unbind and then bind new one */
              if (externalOpenInfo.securityGroup) {
                const initialSg = options.find(({ name }) => name === externalOpenInfo.securityGroup)
                if (initialSg) {
                  addSecurityGroup(
                    initialSg.name,
                    initialSg.defaultAction,
                    [...initialSg.networks.filter(el => el !== formName)],
                    initialSg.logs,
                    initialSg.trace,
                  )
                    .then(() => {
                      /* bind new one if new one exists */
                      if (securityGroup) {
                        const selectedSg = options.find(({ name }) => name === securityGroup)
                        if (selectedSg) {
                          addSecurityGroup(
                            selectedSg.name,
                            selectedSg.defaultAction,
                            [...selectedSg.networks, formName],
                            selectedSg.logs,
                            selectedSg.trace,
                          )
                            .then(() => {
                              setIsLoading(false)
                              setError(undefined)
                              setExternalOpenInfo(false)
                              form.resetFields()
                              if (openNotification) {
                                openNotification('Changes Saved')
                              }
                              const newNetworks = [...initNetworks]
                              const index = newNetworks.findIndex(el => el.name === formName)
                              newNetworks[index] = { ...newNetworks[index], network: { CIDR: formCidr }, securityGroup }
                              setInitNetworks([...newNetworks])
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
                        } else {
                          setError({ status: 'Error while finding security group' })
                        }
                      } else {
                        /* or just make result */
                        setIsLoading(false)
                        setError(undefined)
                        setExternalOpenInfo(false)
                        form.resetFields()
                        if (openNotification) {
                          openNotification('Changes Saved')
                        }
                        const newNetworks = [...initNetworks]
                        const index = newNetworks.findIndex(el => el.name === formName)
                        newNetworks[index] = { ...newNetworks[index], network: { CIDR: formCidr }, securityGroup }
                        setInitNetworks([...newNetworks])
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
                } else {
                  setError({ status: 'Error while finding initial security group' })
                }
              } else if (securityGroup) {
                /* no initial sg: just bind new one */
                const selectedSg = options.find(({ name }) => name === securityGroup)
                if (selectedSg) {
                  addSecurityGroup(
                    selectedSg.name,
                    selectedSg.defaultAction,
                    [...selectedSg.networks, formName],
                    selectedSg.logs,
                    selectedSg.trace,
                  )
                    .then(() => {
                      setIsLoading(false)
                      setError(undefined)
                      setExternalOpenInfo(false)
                      form.resetFields()
                      if (openNotification) {
                        openNotification('Changes Saved')
                      }
                      const newNetworks = [...initNetworks]
                      const index = newNetworks.findIndex(el => el.name === formName)
                      newNetworks[index] = { ...newNetworks[index], network: { CIDR: formCidr }, securityGroup }
                      setInitNetworks([...newNetworks])
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
                } else {
                  setError({ status: 'Error while finding security group' })
                }
              }
            } else {
              /* end of API moment and editing sg logic */
              setIsLoading(false)
              setError(undefined)
              setExternalOpenInfo(false)
              form.resetFields()
              if (openNotification) {
                openNotification('Changes Saved')
              }
              const newNetworks = [...initNetworks]
              const index = newNetworks.findIndex(el => el.name === formName)
              newNetworks[index] = { ...newNetworks[index], network: { CIDR: formCidr }, securityGroup }
              setInitNetworks([...newNetworks])
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
      })
      .catch(() => setError({ status: 'Error while validating' }))
  }

  if (typeof externalOpenInfo === 'boolean') {
    return null
  }

  return (
    <Modal
      title="Edit Network"
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
      okButtonProps={{ disabled: CIDR === externalOpenInfo.CIDR && securityGroup === externalOpenInfo.securityGroup }}
    >
      <Spacer $space={16} $samespace />
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={error.data ? `Code:${error.data.code}. Message: ${error.data.message}` : undefined}
        />
      )}
      <Form<TNetworkFormWithSg> form={form}>
        <Typography.Text>
          Name<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem
          name="name"
          hasFeedback
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Please input network name' }]}
        >
          <Input placeholder="Enter name" size="large" allowClear disabled />
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Typography.Text>
          CIDR<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem
          name="CIDR"
          hasFeedback
          validateTrigger="onBlur"
          rules={[
            () => ({
              validator(_, value: string) {
                if (isCidrValid(value)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Please enter valid type'))
              },
            }),
          ]}
        >
          <Input placeholder="Enter CIDR" size="large" allowClear />
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Typography.Text>Security Group</Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem name="securityGroup" validateTrigger="onBlur">
          <Select
            options={options.map(({ name }) => ({ label: name, value: name }))}
            placeholder="Select security group"
            size="large"
            allowClear
          />
        </Styled.ResetedFormItem>
      </Form>
      <Spacer $space={20} $samespace />
    </Modal>
  )
}
