import { ChangeEventHandler, FC, useState } from 'react'
import { EditOutlined } from '@ant-design/icons'
import { Button, Form, Input, Tooltip } from 'antd'
import type { FormItemProps } from 'antd'
import { renderBadge } from './tableFormatters'

type TEditableDisplayNameControlProps = {
  fallbackName: string
  placeholder: string
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
}

const EditableDisplayNameControl: FC<TEditableDisplayNameControlProps> = ({
  fallbackName,
  placeholder,
  value,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const displayValue = value || fallbackName

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      {isEditing ? (
        <Input
          autoFocus
          value={value}
          onChange={onChange}
          onPressEnter={() => setIsEditing(false)}
          placeholder={placeholder}
          style={{ width: 240, maxWidth: '100%' }}
        />
      ) : (
        <span
          title={displayValue}
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayValue}
        </span>
      )}
      <Tooltip title={isEditing ? 'Hide display name input' : 'Edit display name'}>
        <Button
          aria-label={isEditing ? 'Hide display name input' : 'Edit display name'}
          htmlType="button"
          icon={<EditOutlined />}
          size="small"
          type="text"
          onClick={() => setIsEditing(currentValue => !currentValue)}
        />
      </Tooltip>
    </span>
  )
}

type TEditableResourceTitleProps = {
  fallbackName: string
  kind: string
  placeholder: string
  rules: FormItemProps['rules']
}

export const EditableResourceTitle: FC<TEditableResourceTitleProps> = ({ fallbackName, kind, placeholder, rules }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      maxWidth: '100%',
    }}
  >
    {renderBadge(kind)}
    <Form.Item name="displayName" rules={rules} style={{ margin: 0, minWidth: 0, maxWidth: '100%' }}>
      <EditableDisplayNameControl fallbackName={fallbackName} placeholder={placeholder} />
    </Form.Item>
  </div>
)
