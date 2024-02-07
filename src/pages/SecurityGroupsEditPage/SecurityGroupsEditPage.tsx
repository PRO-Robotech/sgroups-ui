import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { LeftMenuTemplate } from 'templates'
import { SecurityGroupEdit } from 'components'

export const SecurityGroupsEditPage: FC = () => {
  const { securityGroupId } = useParams<{ securityGroupId: string }>()

  return (
    <LeftMenuTemplate>
      <SecurityGroupEdit id={securityGroupId} />
    </LeftMenuTemplate>
  )
}
