import { TablePaginationConfig } from 'antd'
import { SizeType } from 'antd/es/config-provider/SizeContext'
import { ITEMS_PER_PAGE_EDITOR } from 'constants/rules'

export const getDefaultTableProps = (
  forceArrowsUpdate?: () => void,
): {
  pagination: TablePaginationConfig
  virtual: boolean
  scroll: { x?: string | number | true | undefined }
  size: SizeType
} => {
  const paginationProps: TablePaginationConfig = {
    position: ['bottomCenter'],
    showQuickJumper: false,
    showSizeChanger: false,
    defaultPageSize: ITEMS_PER_PAGE_EDITOR,
    onChange: forceArrowsUpdate,
    hideOnSinglePage: true,
  }

  const scrollProps = { x: 'max-content' }

  return {
    pagination: paginationProps,
    virtual: true,
    scroll: scrollProps,
    size: 'small',
  }
}
