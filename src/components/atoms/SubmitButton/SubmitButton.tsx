import React, { FC, useState, useEffect, ReactNode } from 'react'
import type { FormInstance } from 'antd'
import { Button, Form } from 'antd'

type TSubmitButtonProps = {
  form: FormInstance
  children?: ReactNode
}

export const SubmitButton: FC<TSubmitButtonProps> = ({ form, children }) => {
  const [submittable, setSubmittable] = useState<boolean>(false)
  const values = Form.useWatch([], form)

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false))
  }, [form, values])

  return (
    <Button type="primary" htmlType="submit" disabled={!submittable}>
      {children}
    </Button>
  )
}
