import { FC, ReactNode, useState } from 'react'
import { Alert, Modal } from 'antd'
import { deleteEntry } from '@prorobotech/openapi-k8s-toolkit'

type TSgroupsDeleteModalProps = {
  endpoint: string
  title: ReactNode
  onClose: () => void
}

export const SgroupsDeleteModal: FC<TSgroupsDeleteModalProps> = ({ endpoint, title, onClose }) => {
  const [error, setError] = useState<unknown>()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = () => {
    setIsLoading(true)
    setError(undefined)

    deleteEntry({ endpoint })
      .then(() => {
        setIsLoading(false)
        setError(undefined)
        onClose()
      })
      .catch(nextError => {
        setIsLoading(false)
        setError(nextError)
      })
  }

  const errorMessage =
    error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined

  return (
    <Modal
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%', minWidth: 0 }}>
          <span>Delete</span>
          {title}
        </span>
      }
      open
      onOk={handleDelete}
      onCancel={() => {
        onClose()
        setIsLoading(false)
        setError(undefined)
      }}
      okText="Delete"
      confirmLoading={isLoading}
      okButtonProps={{ danger: true }}
      width="fit-content"
      centered
      style={{ maxWidth: 'calc(100vw - 32px)', minWidth: 'min(400px, calc(100vw - 32px))' }}
      styles={{ header: { paddingRight: '30px' } }}
    >
      {Boolean(error) && <Alert type="error" message="Error while delete" description={errorMessage} />}
    </Modal>
  )
}
