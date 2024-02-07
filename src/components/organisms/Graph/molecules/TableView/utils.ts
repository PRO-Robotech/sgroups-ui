import type { ColumnsType } from 'antd/es/table'
import { TColumns } from './types'

export const filterColumns = (columns: ColumnsType<TColumns>, filters: string[] | undefined): ColumnsType<TColumns> => {
  if (!filters || filters.length === 0) {
    return columns
  }
  return columns.filter(column => column.key && !filters.includes(String(column.key)))
}
