import React, { FC, Fragment, useState, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Modal, Form, Input, Button, Typography } from 'antd'
import { TrashSimple, Plus } from '@phosphor-icons/react'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { addNetworks } from 'api/networks'
import { isCidrValid } from 'utils/isCidrValid'
import { TNetworkForm } from 'localTypes/networks'
import { Spacer, FlexButton } from 'components'
import { Styled } from './styled'

type TNetworkAddModalProps = {
  externalOpenInfo: boolean
  setExternalOpenInfo: Dispatch<SetStateAction<boolean>>
  openNotification?: (msg: string) => void
}

export const NetworkAddModal: FC<TNetworkAddModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
}) => {
  const [addForm] = Form.useForm()
  const networks = Form.useWatch<TNetworkForm[]>('networks', addForm)
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const openNwNotification = (isMany: boolean) => {
    if (openNotification) {
      openNotification(isMany ? 'Networks added' : 'Network added')
    }
  }

  const submit = () => {
    addForm
      .validateFields()
      .then(() => {
        setIsLoading(true)
        setError(undefined)
        addNetworks(networks)
          .then(() => {
            setIsLoading(false)
            setError(undefined)
            setExternalOpenInfo(false)
            addForm.resetFields()
            openNwNotification(networks.length > 1)
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

  return (
    <Modal
      title="Add Network"
      open={externalOpenInfo}
      onOk={() => submit()}
      onCancel={() => {
        setExternalOpenInfo(false)
        setIsLoading(false)
        setError(undefined)
        addForm.resetFields()
      }}
      okText="Add"
      confirmLoading={isLoading}
    >
      <Spacer $space={16} $samespace />
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={error.data ? `Code:${error.data.code}. Message: ${error.data.message}` : undefined}
        />
      )}
      <Styled.CustomLabelsContainer>
        <Typography.Text>
          Name<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Typography.Text>
          CIDR<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
      </Styled.CustomLabelsContainer>
      <Form<{ networks: TNetworkForm[] }> form={addForm} initialValues={{ networks: [{ name: '', cidr: '' }] }}>
        <Form.List name="networks">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Styled.FormItemsContainer key={key}>
                  <Styled.ResetedFormItem
                    {...restField}
                    name={[name, 'name']}
                    hasFeedback
                    validateTrigger="onBlur"
                    rules={[{ required: true, message: 'Please input network name' }]}
                  >
                    <Input size="large" allowClear />
                  </Styled.ResetedFormItem>
                  <Styled.ResetedFormItem
                    {...restField}
                    name={[name, 'CIDR']}
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
                  <Button
                    disabled={!networks || networks.length === 1}
                    type="text"
                    size="large"
                    onClick={() => remove(name)}
                    block
                    icon={<TrashSimple size={18} />}
                  />
                </Styled.FormItemsContainer>
              ))}
              <Form.Item>
                <FlexButton size="large" type="dashed" onClick={() => add()} block icon={<Plus size={24} />}>
                  Add More
                </FlexButton>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
