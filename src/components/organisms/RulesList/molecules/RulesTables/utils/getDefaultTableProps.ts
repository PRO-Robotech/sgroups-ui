import { TablePaginationConfig, PaginationProps } from 'antd'
import { SizeType } from 'antd/es/config-provider/SizeContext'
import { ITEMS_PER_PAGE_EDITOR } from 'constants/rules'

const showTotal: PaginationProps['showTotal'] = total => `Total: ${total}`

export const getDefaultTableProps = (): {
  pagination: TablePaginationConfig
  virtual: boolean
  scroll: { x?: string | number | true | undefined }
  size: SizeType
} => {
  const paginationProps: TablePaginationConfig = {
    position: ['bottomLeft'],
    showSizeChanger: true,
    defaultPageSize: ITEMS_PER_PAGE_EDITOR,
    hideOnSinglePage: false,
    showTotal,
  }

  const scrollProps = { x: 'max-content' }

  return {
    pagination: paginationProps,
    virtual: false,
    scroll: scrollProps,
    size: 'small',
  }
}
