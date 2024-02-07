import React, { FC, Fragment, useState, useEffect } from 'react'
import { Button, Breadcrumb, notification } from 'antd'
import { Spacer } from 'components'
import { SingleNetworkAdd } from './molecules'

export const NetworkAdd: FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const [networks, setNetworks] = useState<number[]>([1])
  const [isSubmitBlocked, setSubmitBlocked] = useState<boolean>(false)

  const openNotification = () => {
    api.success({
      message: 'Network added',
      placement: 'topRight',
    })
  }

  const addAnotherNetwork = () => {
    setNetworks([...networks, networks[networks.length - 1] + 1])
  }

  const removeNetwork = (index: number) => {
    setNetworks([...networks].filter(el => el !== index))
  }

  useEffect(() => {
    if (networks.length === 0) {
      setNetworks([1])
    }
  }, [networks])

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
      {networks.map(key => (
        <Fragment key={key}>
          <SingleNetworkAdd
            isSubmitBlocked={isSubmitBlocked}
            setSubmitBlocked={setSubmitBlocked}
            successCb={() => {
              removeNetwork(key)
              openNotification()
            }}
          />
          <Spacer $space={15} $samespace />
        </Fragment>
      ))}
      <Button onClick={addAnotherNetwork} type="dashed">
        Add another
      </Button>
      {contextHolder}
    </>
  )
}
