import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Modal } from 'antd'
import { removeNetwork } from 'api/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork, TNetworkForm } from 'localTypes/networks'

type TNetworkDeleteModalProps = {
  externalOpenInfo: TNetworkForm[] | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<TNetworkForm[] | boolean>>
  initNetworks: TNetwork[]
  setInitNetworks: Dispatch<SetStateAction<TNetwork[]>>
  openNotification?: (msg: string) => void
}

export const NetworkDeleteModal: FC<TNetworkDeleteModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  initNetworks,
  setInitNetworks,
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
          setIsLoading(false)
          setError(undefined)
          setExternalOpenInfo(false)
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
      title={externalOpenInfo.length === 1 ? `Delete ${externalOpenInfo[0].name}` : 'Delete Selected Networks'}
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
      {error && <Result status="error" title={error.status} subTitle={error.data?.message} />}
    </Modal>
  )
}
