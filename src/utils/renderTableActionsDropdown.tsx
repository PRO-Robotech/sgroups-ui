import React from 'react'
import { MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, MenuProps } from 'antd'

type TRenderTableActionsDropdownParams<T> = {
  record: T
  label: string
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
}

export const renderTableActionsDropdown = <T,>({
  label,
  onDelete,
  onEdit,
  record,
}: TRenderTableActionsDropdownParams<T>) => {
  if (!onEdit && !onDelete) {
    return null
  }

  const items: NonNullable<MenuProps['items']> = []

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
