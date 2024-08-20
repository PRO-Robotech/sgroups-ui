import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Alert, Modal } from 'antd'
import { removeNetwork } from 'api/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork, TNetworkForm } from 'localTypes/networks'
import { TSecurityGroup } from 'localTypes/securityGroups'

type TNetworkDeleteModalProps = {
  externalOpenInfo: TNetworkForm[] | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<TNetworkForm[] | boolean>>
  initNetworks: TNetwork[]
  setInitNetworks: Dispatch<SetStateAction<TNetwork[]>>
  securityGroups: TSecurityGroup[]
  setSecurityGroups: Dispatch<SetStateAction<TSecurityGroup[]>>
  clearSelected: () => void
  openNotification?: (msg: string) => void
}

export const NetworkDeleteModal: FC<TNetworkDeleteModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  initNetworks,
  clearSelected,
  setInitNetworks,
  securityGroups,
  setSecurityGroups,
  openNotification,
}) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const removeNetworkFromList = () => {
    if (typeof externalOpenInfo !== 'boolean') {
      setIsLoading(true)
      setError(undefined)
      const names = externalOpenInfo.map(({ name }) => name)
      removeNetwork(names)
        .then(() => {
          const newSecurityGroups = [...securityGroups].map(el => ({
            ...el,
            networks: el.networks.filter(nw => !names.includes(nw)),
          }))
          setSecurityGroups(newSecurityGroups)
          setIsLoading(false)
          setError(undefined)
          setExternalOpenInfo(false)
          clearSelected()
          if (openNotification) {
            openNotification(names.length === 1 ? `${names[0]} Deleted` : 'Networks Deleted')
          }
          setInitNetworks([...initNetworks].filter(el => !names.includes(el.name)))
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
      title={externalOpenInfo.length === 1 ? `Delete ${externalOpenInfo[0].name}?` : 'Delete Selected Networks?'}
      open={typeof externalOpenInfo !== 'boolean'}
      onOk={() => removeNetworkFromList()}
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
