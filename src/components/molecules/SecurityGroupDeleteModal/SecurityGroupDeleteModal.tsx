import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Spin, Modal } from 'antd'
import { removeSecurityGroup } from 'api/securityGroups'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'

type TSecurityGroupDeleteModalProps = {
  externalOpenInfo: string | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<string | boolean>>
  securityGroups: TSecurityGroup[]
  setSecurityGroups: Dispatch<SetStateAction<TSecurityGroup[]>>
  openNotification?: (msg: string) => void
}

export const SecurityGroupDeleteModal: FC<TSecurityGroupDeleteModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  securityGroups,
  setSecurityGroups,
  openNotification,
}) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const removeSgFromList = () => {
    if (typeof externalOpenInfo === 'string') {
      setIsLoading(true)
      removeSecurityGroup(externalOpenInfo)
        .then(() => {
          setSecurityGroups([...securityGroups].filter(el => el.name !== externalOpenInfo))
          if (openNotification) {
            openNotification('Network deleted')
          }
          setError(undefined)
          setExternalOpenInfo(false)
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
      title="Delete security group"
      open={externalOpenInfo !== false}
      onOk={() => removeSgFromList()}
      confirmLoading={isLoading}
      onCancel={() => {
        setExternalOpenInfo(false)
        setError(undefined)
      }}
    >
      <p>Are you sure you want to delete {externalOpenInfo}</p>
      {isLoading && <Spin />}
      {error && <Result status="error" title={error.status} subTitle={error.data?.message} />}
    </Modal>
  )
}
