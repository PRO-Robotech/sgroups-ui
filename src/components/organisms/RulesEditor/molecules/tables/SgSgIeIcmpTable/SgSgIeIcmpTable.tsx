/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps, TableRowSelection } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { ThWhiteSpaceNoWrap } from 'components/atoms'
import { ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormSgSgIeIcmpRule, TTraffic } from 'localTypes/rules'
import { EditSgSgIeIcmpPopover } from '../../../atoms'
import { Styled } from '../styled'

type TSgSgIeIcmpTableProps = {
  isChangesMode: boolean
  sgNames: string[]
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rulesData: TFormSgSgIeIcmpRule[]
  rulesAll: TFormSgSgIeIcmpRule[]
  setRules: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  isDisabled?: boolean
  forceArrowsUpdate?: () => void
}

export const SgSgIeIcmpTable: FC<TSgSgIeIcmpTableProps> = ({
  isChangesMode,
  sgNames,
  popoverPosition,
  defaultTraffic,
  rulesData,
  rulesAll,
  setRules,
  setEditOpen,
  editOpen,
  isDisabled,
  forceArrowsUpdate,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  useEffect(() => {
    setEditOpen(
      Array(rulesData.filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted).length).fill(false),
    )
  }, [rulesData, setEditOpen])

  const toggleEditPopover = (index: number) => {
    const newEditOpen = [...editOpen]
    newEditOpen[index] = !newEditOpen[index]
    setEditOpen(newEditOpen)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const editRule = (oldValues: TFormSgSgIeIcmpRule, values: TFormSgSgIeIcmpRule) => {
    const newSgSgIeIcmpRules = [...rulesAll]
    const index = newSgSgIeIcmpRules.findIndex(
      ({ sg, IPv, types, logs, trace, traffic }) =>
        sg === oldValues.sg &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic,
    )
    if (newSgSgIeIcmpRules[index].formChanges?.status === STATUSES.new) {
      newSgSgIeIcmpRules[index] = { ...values, traffic: defaultTraffic, formChanges: { status: STATUSES.new } }
    } else {
      const modifiedFields = []
      if (newSgSgIeIcmpRules[index].sg !== values.sg) {
        modifiedFields.push('sg')
      }
      if (newSgSgIeIcmpRules[index].IPv !== values.IPv) {
        modifiedFields.push('ipv')
      }
      if (JSON.stringify(newSgSgIeIcmpRules[index].types.sort()) !== JSON.stringify(values.types.sort())) {
        modifiedFields.push('types')
      }
      if (newSgSgIeIcmpRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (modifiedFields.length === 0) {
        newSgSgIeIcmpRules[index] = { ...values }
      } else {
        newSgSgIeIcmpRules[index] = {
          ...values,
          traffic: defaultTraffic,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
      }
    }
    setRules(newSgSgIeIcmpRules)
    toggleEditPopover(index)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (oldValues: TFormSgSgIeIcmpRule) => {
    const newSgSgIeIcmpRules = [...rulesAll]
    const newEditOpenRules = [...editOpen]
    const index = newSgSgIeIcmpRules.findIndex(
      ({ sg, IPv, types, logs, trace, traffic }) =>
        sg === oldValues.sg &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic,
    )
    if (newSgSgIeIcmpRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newSgSgIeIcmpRules.slice(0, index), ...newSgSgIeIcmpRules.slice(index + 1)])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newSgSgIeIcmpRules[index] = {
        ...newSgSgIeIcmpRules[index],
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.deleted },
      }
      setRules(newSgSgIeIcmpRules)
      toggleEditPopover(index)
    }
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  type TColumn = TFormSgSgIeIcmpRule & { key: string }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'ICMP',
      dataIndex: 'IPv',
      key: 'IPv',
      width: 50,
      render: (_, { IPv, formChanges }) => (
        <Styled.RulesEntrySgs $modified={formChanges?.modifiedFields?.includes('ipv')} className="no-scroll">
          {IPv}
        </Styled.RulesEntrySgs>
      ),
      sorter: (a, b) => {
        if (a.IPv === b.IPv) {
          return 0
        }
        return a.IPv === 'IPv6' ? -1 : 1
      },
    },
    {
      title: 'SG Name',
      dataIndex: 'sg',
      key: 'sg',
      width: 150,
      render: (_, { sg, formChanges }) => (
        <Styled.RulesEntrySgs $modified={formChanges?.modifiedFields?.includes('sg')} className="no-scroll">
          {sg}
        </Styled.RulesEntrySgs>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
          <Input
            placeholder="search"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys as string[], confirm)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
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
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, { sg }) =>
        sg
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
    },
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      width: 50,
      render: (_, { types, formChanges }) => (
        <Styled.RulesEntrySgs $modified={formChanges?.modifiedFields?.includes('types')} className="no-scroll">
          {types.join(',')}
        </Styled.RulesEntrySgs>
      ),
      sorter: (a, b) => {
        if (a.types.length === b.types.length) {
          return 0
        }
        return a.types.length > b.types.length ? -1 : 1
      },
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 50,
      render: (_, { logs, formChanges }) => (
        <Styled.RulesEntryMarks $modified={formChanges?.modifiedFields?.includes('logs')} className="no-scroll">
          <Tooltip title="Logs">
            {logs ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
          </Tooltip>
        </Styled.RulesEntryMarks>
      ),
      sorter: (a, b) => {
        if (a.logs === b.logs) {
          return 0
        }
        return a.logs ? -1 : 1
      },
    },
    {
      title: 'Trace',
      dataIndex: 'trace',
      key: 'trace',
      width: 50,
      render: (_, { trace, formChanges }) => (
        <Styled.RulesEntryMarks $modified={formChanges?.modifiedFields?.includes('trace')} className="no-scroll">
          <Tooltip title="trace">
            {trace ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
          </Tooltip>
        </Styled.RulesEntryMarks>
      ),
      sorter: (a, b) => {
        if (a.trace === b.trace) {
          return 0
        }
        return a.trace ? -1 : 1
      },
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 50,
      render: (_, oldValues, index) => (
        <Popover
          content={
            <EditSgSgIeIcmpPopover
              sgNames={sgNames}
              values={oldValues}
              remove={() => removeRule(oldValues)}
              hide={() => toggleEditPopover(index)}
              edit={values => editRule(oldValues, values)}
              isDisabled={isDisabled}
            />
          }
          title="SG-SG-IE-ICMP"
          trigger="click"
          open={editOpen[index]}
          onOpenChange={() => toggleEditPopover(index)}
          placement={popoverPosition}
          className="no-scroll"
        >
          <Styled.EditButton>Edit</Styled.EditButton>
        </Popover>
      ),
    },
  ]

  const dataSource = isChangesMode
    ? rulesData.map(row => ({
        ...row,
        key: `${row.sg}-${row.IPv}`,
      }))
    : rulesData
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.sg}-${row.IPv}`,
        }))

  const rowSelection: TableRowSelection<TColumn> | undefined = isChangesMode
    ? {
        selectedRowKeys,
        type: 'checkbox',
        onChange: (newSelectedRowKeys, newSelectedRows) => {
          const newRules = [...rulesAll]
          const uncheckedKeys = selectedRowKeys.filter(el => !newSelectedRowKeys.includes(el))
          const checkedIndexes = newSelectedRows
            .filter(({ key }) => newSelectedRowKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ sg, IPv, types, logs, trace, traffic }) =>
                  sg === newRow.sg &&
                  IPv === newRow.IPv &&
                  JSON.stringify(types.sort()) === JSON.stringify(newRow.types.sort()) &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic,
              ),
            )
          const uncheckedIndexes = newSelectedRows
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ sg, IPv, types, logs, trace, traffic }) =>
                  sg === newRow.sg &&
                  IPv === newRow.IPv &&
                  JSON.stringify(types.sort()) === JSON.stringify(newRow.types.sort()) &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic,
              ),
            )
          checkedIndexes.forEach(
            // eslint-disable-next-line no-return-assign
            checkedIndex => (newRules[checkedIndex] = { ...newRules[checkedIndex], checked: true }),
          )
          uncheckedIndexes.forEach(
            // eslint-disable-next-line no-return-assign
            checkedIndex => (newRules[checkedIndex] = { ...newRules[checkedIndex], checked: false }),
          )
          setRules(newRules)
          setSelectedRowKeys(newSelectedRowKeys)
        },
        onSelect: (record: TColumn, selected: boolean) => {
          const newRules = [...rulesAll]
          const pendingToCheckRuleIndex = newRules.findIndex(
            ({ sg, IPv, types, logs, trace, traffic }) =>
              sg === record.sg &&
              IPv === record.IPv &&
              JSON.stringify(types.sort()) === JSON.stringify(record.types.sort()) &&
              logs === record.logs &&
              trace === record.trace &&
              traffic === record.traffic,
          )
          if (selected) {
            newRules[pendingToCheckRuleIndex] = { ...newRules[pendingToCheckRuleIndex], checked: true }
          } else {
            newRules[pendingToCheckRuleIndex] = { ...newRules[pendingToCheckRuleIndex], checked: false }
          }
          setRules(newRules)
        },
        columnWidth: 16,
      }
    : undefined

  return (
    <ThWhiteSpaceNoWrap>
      <Table
        pagination={{
          position: ['bottomCenter'],
          showQuickJumper: false,
          showSizeChanger: false,
          defaultPageSize: ITEMS_PER_PAGE_EDITOR,
          onChange: forceArrowsUpdate,
          hideOnSinglePage: true,
        }}
        dataSource={dataSource}
        columns={columns}
        virtual
        scroll={{ x: 'max-content' }}
        size="small"
        rowSelection={rowSelection}
      />
    </ThWhiteSpaceNoWrap>
  )
}
