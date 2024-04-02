import React, { FC } from 'react'
import { Modal } from 'antd'

type TSelectMainSgModal = {
  isOpen: boolean
  handleOk: () => void
  handleCancel: () => void
}

export const SelectMainSgModal: FC<TSelectMainSgModal> = ({ isOpen, handleOk, handleCancel }) => (
  <Modal title="You have unsaved changes" open={isOpen} onOk={handleOk} onCancel={handleCancel}>
    Are you sure you want to change center SG?
  </Modal>
)
