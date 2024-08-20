import { LabeledValue } from 'antd/es/select'

export type TFieldData = {
  name: string
  value?: string | string[] | number | number[] | LabeledValue | LabeledValue[]
  touched?: boolean
  validating?: boolean
  errors?: string[]
}
