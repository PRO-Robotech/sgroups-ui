import React, { FC, Key, Dispatch, SetStateAction } from 'react'
import { Button, Input, Space } from 'antd'
import { FilterConfirmProps, FilterDropdownProps } from 'antd/es/table/interface'

type TFilterDropdownProps = {
  setSelectedKeys: (selectedKeys: React.Key[]) => void
  selectedKeys: Key[]
  confirm: (param?: FilterConfirmProps | undefined) => void
  close: () => void
  setSearchText: Dispatch<SetStateAction<string>>
  clearFilters?: () => void
}

export const FilterDropdown: FC<TFilterDropdownProps> = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
  setSearchText,
}) => {
  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm({ closeDropdown: false })
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  return (
    <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
      <Input
        placeholder="search"
        value={selectedKeys[0]}
        onChange={e => {
          setSelectedKeys(e.target.value ? [e.target.value] : [])
          handleSearch(e.target.value ? [e.target.value] : ([] as string[]), confirm)
        }}
        onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          onClick={() => {
            if (clearFilters) {
              clearFilters()
              handleReset(clearFilters)
            }
            handleSearch([], confirm)
          }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            close()
          }}
        >
          close
        </Button>
      </Space>
    </div>
  )
}
