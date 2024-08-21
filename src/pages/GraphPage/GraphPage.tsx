import React, { FC, useEffect } from 'react'
import { notification } from 'antd'
import { BaseTemplate } from 'templates'
import { Graph } from 'components'

export const GraphPage: FC = () => {
  const [api, contextHolder] = notification.useNotification()

  useEffect(() => {
    const notify = () => {
      api.warning({
        message: 'Deprecated',
        description: 'For deprecated sg-sg rules. TCP/UDP only',
      })
    }

    notify()
  }, [api])

  return (
    <BaseTemplate>
      <Graph />
      {contextHolder}
    </BaseTemplate>
  )
}
