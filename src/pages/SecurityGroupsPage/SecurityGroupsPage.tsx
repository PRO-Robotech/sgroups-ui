import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { BaseTemplate } from 'templates'
import { SecurityGroupsList } from 'components'

export const SecurityGroupsPage: FC = () => {
  const { securityGroupId } = useParams<{ securityGroupId?: string }>()

  return (
    <BaseTemplate>
      <SecurityGroupsList id={securityGroupId} />
    </BaseTemplate>
  )
}
