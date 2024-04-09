import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { RulesEditor } from 'components'

export const RulesEditorPage: FC = () => {
  const { securityGroupId } = useParams<{ securityGroupId?: string }>()

  return <RulesEditor id={securityGroupId} />
}
