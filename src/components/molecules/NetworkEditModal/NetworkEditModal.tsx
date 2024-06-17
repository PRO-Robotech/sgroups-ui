import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Card, Form, Input, Result, Spin, Modal } from 'antd'
import { TitleWithNoTopMargin, Spacer, SubmitButton } from 'components'
import { getNetworkByName, editNetwork } from 'api/networks'
import { isCidrValid } from 'utils/isCidrValid'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork } from 'localTypes/networks'
import { Styled } from './styled'

type TNetworkEditModalProps = {
  externalOpenInfo: string | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<string | boolean>>
  openNotification?: (msg: string) => void
}

export const NetworkEditModal: FC<TNetworkEditModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
}) => {
  const [form] = Form.useForm()
  const [network, setNetwork] = useState<TNetwork>()
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (typeof externalOpenInfo === 'string') {
      setIsLoading(true)
      setError(undefined)
      getNetworkByName(externalOpenInfo)
        .then(({ data }) => {
          setNetwork(data.networks[0])
          form.setFieldsValue({
            cidr: data.networks[0].network.CIDR,
          })
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
    }
  }, [externalOpenInfo, form])

  const onFinish = ({ cidr }: { cidr: string }) => {
    setIsLoading(true)
    setError(undefined)
    if (typeof externalOpenInfo === 'string') {
      editNetwork(externalOpenInfo, cidr)
        .then(() => {
          setIsLoading(false)
          if (openNotification) {
            openNotification('Network edited')
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
      title="Edit network"
      open={externalOpenInfo !== false}
      onOk={() => setExternalOpenInfo(false)}
      onCancel={() => setExternalOpenInfo(false)}
    >
      {isLoading && <Spin />}
      {error && <Result status="error" title={error.status} subTitle={error.data?.message} />}
      {!isLoading && !error && network && (
        <Card>
          <TitleWithNoTopMargin level={2}>Edit the network</TitleWithNoTopMargin>
          <Spacer $space={15} $samespace />
          <Form form={form} name="control-hooks" onFinish={onFinish}>
            <Styled.Container>
              <Styled.FormItem
                name="cidr"
                label="CIDR"
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
                <Input allowClear />
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
