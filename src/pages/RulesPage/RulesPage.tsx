import React, { FC } from 'react'
import { useParams } from 'react-router-dom'
import { BaseTemplate } from 'templates'
import { RulesList } from 'components'

export const RulesPage: FC = () => {
  const { typeId } = useParams<{ typeId?: string }>()

  if (!typeId) {
    return null
  }

  return (
    <BaseTemplate>
      <RulesList typeId={typeId} />
    </BaseTemplate>
  )
}
