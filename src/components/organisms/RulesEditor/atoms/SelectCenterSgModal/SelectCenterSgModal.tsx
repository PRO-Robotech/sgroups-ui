import React, { FC } from 'react'
import { Modal } from 'antd'

type TSelectCenterSgModalProps = {
  isOpen: boolean
  handleOk: () => void
  handleCancel: () => void
}

export const SelectCenterSgModal: FC<TSelectCenterSgModalProps> = ({ isOpen, handleOk, handleCancel }) => (
  <Modal title="You have unsaved changes" open={isOpen} onOk={handleOk} onCancel={handleCancel}>
    Are you sure you want to change center SG?
  </Modal>
)
