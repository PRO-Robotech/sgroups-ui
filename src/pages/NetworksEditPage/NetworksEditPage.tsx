import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { BaseTemplate } from 'templates'
import { NetworkEdit } from 'components'

export const NetworksEditPage: FC = () => {
  const { networkId } = useParams<{ networkId: string }>()

  return (
    <BaseTemplate>
      <NetworkEdit id={networkId} />
    </BaseTemplate>
  )
}
