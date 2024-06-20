import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Modal, Form, Input, Typography } from 'antd'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { editNetwork } from 'api/networks'
import { isCidrValid } from 'utils/isCidrValid'
import { TNetworkForm, TNetwork } from 'localTypes/networks'
import { Spacer } from 'components'
import { Styled } from './styled'

type TNetworkEditModalProps = {
  externalOpenInfo: TNetworkForm | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<TNetworkForm | boolean>>
  openNotification?: (msg: string) => void
  initNetworks: TNetwork[]
  setInitNetworks: Dispatch<SetStateAction<TNetwork[]>>
}

export const NetworkEditModal: FC<TNetworkEditModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
  initNetworks,
  setInitNetworks,
}) => {
  const [form] = Form.useForm()
  const CIDR = Form.useWatch<string>('CIDR', form)
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (typeof externalOpenInfo !== 'boolean') {
      form.setFieldsValue({ name: externalOpenInfo.name, CIDR: externalOpenInfo.CIDR })
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
            setIsLoading(false)
            setError(undefined)
            setExternalOpenInfo(false)
            form.resetFields()
            if (openNotification) {
              openNotification('Changes Saved')
            }
            const newNetworks = [...initNetworks]
            const index = newNetworks.findIndex(el => el.name === formName)
            newNetworks[index] = { ...newNetworks[index], network: { CIDR: formCidr } }
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
      okButtonProps={{ disabled: CIDR === externalOpenInfo.CIDR }}
    >
      <Spacer $space={16} $samespace />
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={error.data ? `Code:${error.data.code}. Message: ${error.data.message}` : undefined}
        />
      )}
      <Form<TNetworkForm> form={form}>
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
          <Input size="large" allowClear disabled />
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
          <Input size="large" allowClear />
        </Styled.ResetedFormItem>
      </Form>
      <Spacer $space={20} $samespace />
    </Modal>
  )
}
