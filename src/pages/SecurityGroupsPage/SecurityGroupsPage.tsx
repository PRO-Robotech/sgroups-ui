import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { LeftMenuTemplate } from 'templates'
import { SecurityGroupsList } from 'components'

export const SecurityGroupsPage: FC = () => {
  const { securityGroupId } = useParams<{ securityGroupId?: string }>()

  return (
    <LeftMenuTemplate>
      <SecurityGroupsList id={securityGroupId} />
    </LeftMenuTemplate>
  )
}
