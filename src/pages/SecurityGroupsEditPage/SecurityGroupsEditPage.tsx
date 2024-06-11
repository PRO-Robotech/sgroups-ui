import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { BaseTemplate } from 'templates'
import { SecurityGroupEdit } from 'components'

export const SecurityGroupsEditPage: FC = () => {
  const { securityGroupId } = useParams<{ securityGroupId: string }>()

  return (
    <BaseTemplate>
      <SecurityGroupEdit id={securityGroupId} />
    </BaseTemplate>
  )
}
