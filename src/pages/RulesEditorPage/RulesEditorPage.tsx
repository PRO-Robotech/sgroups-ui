import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { RulesEditorTemplate } from 'templates'
import { RulesEditor } from 'components'

export const RulesEditorPage: FC = () => {
  const { securityGroupId } = useParams<{ securityGroupId?: string }>()

  return (
    <RulesEditorTemplate>
      <RulesEditor id={securityGroupId} />
    </RulesEditorTemplate>
  )
}
