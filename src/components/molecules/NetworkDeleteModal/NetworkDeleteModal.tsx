import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Result, Spin, Modal } from 'antd'
import { removeNetwork } from 'api/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork } from 'localTypes/networks'

type TNetworkDeleteModalProps = {
  externalOpenInfo: string | boolean
  setExternalOpenInfo: Dispatch<SetStateAction<string | boolean>>
  networks: TNetwork[]
  setNetworks: Dispatch<SetStateAction<TNetwork[]>>
  openNotification?: (msg: string) => void
}

export const NetworkDeleteModal: FC<TNetworkDeleteModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  networks,
  setNetworks,
  openNotification,
}) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const removeNetworkFromList = () => {
    if (typeof externalOpenInfo === 'string') {
      setIsLoading(true)
      removeNetwork(externalOpenInfo)
        .then(() => {
          setNetworks([...networks].filter(el => el.name !== externalOpenInfo))
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
      title="Delete network"
      open={externalOpenInfo !== false}
      onOk={() => removeNetworkFromList()}
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
