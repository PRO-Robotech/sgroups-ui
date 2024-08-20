import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Alert, Modal } from 'antd'
import { removeSecurityGroup } from 'api/securityGroups'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'

type TSecurityGroupDeleteModalProps = {
  externalOpenInfo: TSecurityGroup[] | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<TSecurityGroup[] | boolean>>
  initSecurityGroups: TSecurityGroup[]
  setInitSecurityGroups: Dispatch<SetStateAction<TSecurityGroup[]>>
  clearSelected: () => void
  openNotification?: (msg: string) => void
}

export const SecurityGroupDeleteModal: FC<TSecurityGroupDeleteModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
  clearSelected,
  initSecurityGroups,
  setInitSecurityGroups,
}) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const removeSecurityGroupFromList = () => {
    if (typeof externalOpenInfo !== 'boolean') {
      setIsLoading(true)
      setError(undefined)
      const names = externalOpenInfo.map(({ name }) => name)
      removeSecurityGroup(names)
        .then(() => {
          setIsLoading(false)
          setError(undefined)
          setExternalOpenInfo(false)
          clearSelected()
          if (openNotification) {
            openNotification(names.length === 1 ? `${names[0]} Deleted` : 'Networks Deleted')
          }
          setInitSecurityGroups([...initSecurityGroups].filter(el => !names.includes(el.name)))
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

  if (typeof externalOpenInfo === 'boolean') {
    return null
  }

  return (
    <Modal
      title={externalOpenInfo.length === 1 ? `Delete ${externalOpenInfo[0].name}?` : 'Delete Selected Security Grops?'}
      open={typeof externalOpenInfo !== 'boolean'}
      onOk={() => removeSecurityGroupFromList()}
      onCancel={() => {
        setExternalOpenInfo(false)
        setIsLoading(false)
        setError(undefined)
      }}
      okText="Delete"
      confirmLoading={isLoading}
      okButtonProps={{ danger: true }}
    >
      {error && (
        <Alert
          message={error.status}
          description={error.data ? `Code:${error.data.code}. Message: ${error.data.message}` : undefined}
          type="error"
          showIcon
          closable
        />
      )}
    </Modal>
  )
}
