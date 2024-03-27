import React, { FC, Fragment, useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { Button, Breadcrumb, notification, Spin, Result } from 'antd'
import { Spacer } from 'components'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetworkForm } from 'localTypes/networks'
import { addNetworks } from 'api/networks'
import { SingleNetworkAdd } from './molecules'

export const NetworkAdd: FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const [error, setError] = useState<TRequestError | undefined>()
  const [networks, setNetworks] = useState<TNetworkForm[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const openNotification = () => {
    api.success({
      message: 'Network added',
      placement: 'topRight',
    })
  }

  const addAnotherNetwork = () => {
    setNetworks([...networks, { id: networks[networks.length - 1].id + 1, name: '', CIDR: '' }])
  }

  useEffect(() => {
    if (networks.length === 0) {
      setNetworks([{ id: 0, name: '', CIDR: '' }])
    }
  }, [networks])

  const onFormChange = (id: number, name: string, CIDR: string) => {
    const index = networks.findIndex(el => el.id === id)
    const newNetworks = [...networks]
    newNetworks[index] = { id, name, CIDR }
    setNetworks(newNetworks)
  }

  const submit = () => {
    setIsLoading(true)
    setError(undefined)
    addNetworks(networks)
      .then(() => {
        setIsLoading(false)
        openNotification()
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
    <>
      <Breadcrumb
        items={[
          {
            href: '/networks',
            title: 'Networks',
          },
          {
            title: 'Add',
          },
        ]}
      />
      <Spacer $space={15} $samespace />
      {isLoading && <Spin />}
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
        />
      )}
      {networks.map(({ id }) => (
        <Fragment key={id}>
          <SingleNetworkAdd
            onFormChange={(values: Pick<TNetworkForm, 'name' | 'CIDR'>) => onFormChange(id, values.name, values.CIDR)}
          />
          <Spacer $space={15} $samespace />
        </Fragment>
      ))}
      <Button onClick={addAnotherNetwork} type="dashed">
        Add another
      </Button>
      <br />
      <Button onClick={submit} type="primary">
        Submit all
      </Button>
      {contextHolder}
    </>
  )
}
