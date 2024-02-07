import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { LeftMenuTemplate } from 'templates'
import { NetworkEdit } from 'components'

export const NetworksEditPage: FC = () => {
  const { networkId } = useParams<{ networkId: string }>()

  return (
    <LeftMenuTemplate>
      <NetworkEdit id={networkId} />
    </LeftMenuTemplate>
  )
}
