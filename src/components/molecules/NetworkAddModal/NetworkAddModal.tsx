import React, { FC, Fragment, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { AxiosError } from 'axios'
import { Button, Spin, Result, Modal } from 'antd'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetworkForm } from 'localTypes/networks'
import { addNetworks } from 'api/networks'
import { SingleNetworkAdd } from './molecules'

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
  const [networks, setNetworks] = useState<TNetworkForm[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (networks.length === 0) {
      setNetworks([{ id: 0, name: '', CIDR: '', validateResult: false }])
    }
  }, [networks])

  const addAnotherNetwork = () => {
    setNetworks([...networks, { id: networks[networks.length - 1].id + 1, name: '', CIDR: '', validateResult: false }])
  }

  const removeNwCard = (id: number) => {
    setNetworks([...networks].filter(el => el.id !== id))
  }

  const openNwNotification = (isMany: boolean) => {
    if (openNotification) {
      openNotification(isMany ? 'Networks added' : 'Network added')
    }
  }

  const onFormChange = (id: number, name: string, CIDR: string, validateResult: boolean) => {
    const index = networks.findIndex(el => el.id === id)
    const newNetworks = [...networks]
    newNetworks[index] = { id, name, CIDR, validateResult }
    setNetworks(newNetworks)
  }

  const submit = () => {
    setIsLoading(true)
    setError(undefined)
    addNetworks(networks)
      .then(() => {
        setIsLoading(false)
        openNwNotification(networks.length > 1)
        setNetworks([])
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
  }

  return (
    <Modal
      title="Add networks"
      open={externalOpenInfo}
      onOk={() => setExternalOpenInfo(false)}
      onCancel={() => setExternalOpenInfo(false)}
    >
      {isLoading && <Spin />}
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
        />
      )}
      <TitleWithNoTopMargin level={2}>Add a network</TitleWithNoTopMargin>
      {networks.map(({ id }) => (
        <Fragment key={id}>
          <SingleNetworkAdd
            onFormChange={(values: Pick<TNetworkForm, 'name' | 'CIDR'>, validateResult: boolean) =>
              onFormChange(id, values.name, values.CIDR, validateResult)
            }
            removeNwCard={() => removeNwCard(id)}
            isDeleteButtonDisabled={networks.length < 2}
          />
          <Spacer $space={15} $samespace />
        </Fragment>
      ))}
      <Button onClick={addAnotherNetwork} type="dashed">
        Add another
      </Button>
      <Spacer $space={15} $samespace />
      <Button
        onClick={submit}
        type="primary"
        disabled={networks.some(({ validateResult }) => validateResult === false)}
      >
        Submit all
      </Button>
    </Modal>
  )
}
