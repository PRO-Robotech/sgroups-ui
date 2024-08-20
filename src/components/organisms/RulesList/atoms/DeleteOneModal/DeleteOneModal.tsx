import React, { ReactElement } from 'react'
import { Modal } from 'antd'

type TDeleteOneModalProps<T> = {
  values: T | boolean
  hide: () => void
  remove: () => void
}

export const DeleteOneModal = <T,>({ values, hide, remove }: TDeleteOneModalProps<T>): ReactElement | null => {
  if (typeof values === 'boolean') {
    return null
  }

  return (
    <Modal
      title="Delete Rule"
      open={typeof values !== 'boolean'}
      onOk={() => {
        remove()
        hide()
      }}
      onCancel={() => {
        hide()
      }}
      okText="Delete"
      okButtonProps={{ danger: true }}
    />
  )
}
