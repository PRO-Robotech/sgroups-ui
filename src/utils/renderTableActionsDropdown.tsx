import React from 'react'
import { MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, MenuProps } from 'antd'

type TRenderTableActionsDropdownParams<T> = {
  record: T
  label: string
  extraActions?: Array<{
    key: string
    label: string
    danger?: boolean
    onClick: (record: T) => void
  }>
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
}

export const renderTableActionsDropdown = <T,>({
  extraActions = [],
  label,
  onDelete,
  onEdit,
  record,
}: TRenderTableActionsDropdownParams<T>) => {
  if (!onEdit && !onDelete && extraActions.length === 0) {
    return null
  }

  const items: NonNullable<MenuProps['items']> = []

  extraActions.forEach(action => {
    items.push({
      key: action.key,
      label: action.label,
      danger: action.danger,
    })
  })

  if (onEdit) {
    items.push({
      key: 'edit',
      label: 'Edit',
    })
  }

  if (onDelete) {
    items.push({
      key: 'delete',
      label: 'Delete',
      danger: true,
    })
  }

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['click']}
      menu={{
        items,
        onClick: ({ domEvent, key }) => {
          domEvent.preventDefault()
          domEvent.stopPropagation()

          const extraAction = extraActions.find(action => action.key === key)

          if (extraAction) {
            extraAction.onClick(record)
          }

          if (key === 'edit') {
            onEdit?.(record)
          }

          if (key === 'delete') {
            onDelete?.(record)
          }
        },
      }}
    >
      <Button
        aria-label={`Actions for ${label}`}
        type="text"
        size="small"
        icon={<MoreOutlined />}
        style={{ height: 24, width: 24, padding: 0 }}
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      />
    </Dropdown>
  )
}
