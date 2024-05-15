/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps, TableRowSelection } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormSgSgIcmpRule } from 'localTypes/rules'
import { EditSgSgIcmpPopover } from '../../../atoms'
import { Styled } from '../styled'

type TSgSgIcmpTableProps = {
  isChangesMode: boolean
  sgNames: string[]
  popoverPosition: TooltipPlacement
  rulesData: TFormSgSgIcmpRule[]
  rulesAll: TFormSgSgIcmpRule[]
  setRules: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesOtherside: TFormSgSgIcmpRule[]
  setRulesOtherside: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  editOpen: boolean[]
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  centerSg?: string
  isDisabled?: boolean
  isRestoreButtonActive?: boolean
  forceArrowsUpdate?: () => void
}

export const SgSgIcmpTable: FC<TSgSgIcmpTableProps> = ({
  isChangesMode,
  sgNames,
  popoverPosition,
  rulesData,
  rulesAll,
  setRules,
  rulesOtherside,
  setRulesOtherside,
  editOpen,
  setEditOpen,
  centerSg,
  isDisabled,
  isRestoreButtonActive,
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
  const editRule = (oldValues: TFormSgSgIcmpRule, values: TFormSgSgIcmpRule) => {
    const newSgSgIcmpRules = [...rulesAll]
    const index = newSgSgIcmpRules.findIndex(
      ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
        sg === oldValues.sg &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    const newSgSgIcmpRulesOtherside = [...rulesOtherside]
    const newSgSgSgIcmpRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
        sg === centerSg &&
        IPv === newSgSgIcmpRules[index].IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(newSgSgIcmpRules[index].types.sort()) &&
        logs === newSgSgIcmpRules[index].logs &&
        trace === newSgSgIcmpRules[index].trace &&
        action === newSgSgIcmpRules[index].action &&
        prioritySome === newSgSgIcmpRules[index].prioritySome,
    )
    if (newSgSgIcmpRules[index].formChanges?.status === STATUSES.new) {
      newSgSgIcmpRules[index] = {
        ...values,
        formChanges: { status: STATUSES.new },
      }
      newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
        ...values,
        formChanges: { status: STATUSES.new },
      }
    } else {
      const modifiedFields = []
      if (newSgSgIcmpRules[index].sg !== values.sg) {
        modifiedFields.push('sg')
      }
      if (newSgSgIcmpRules[index].IPv !== values.IPv) {
        modifiedFields.push('ipv')
      }
      if (JSON.stringify(newSgSgIcmpRules[index].types.sort()) !== JSON.stringify(values.types.sort())) {
        modifiedFields.push('types')
      }
      if (newSgSgIcmpRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (newSgSgIcmpRules[index].trace !== values.trace) {
        modifiedFields.push('trace')
      }
      if (newSgSgIcmpRules[index].action !== values.action) {
        modifiedFields.push('action')
      }
      if (newSgSgIcmpRules[index].prioritySome !== values.prioritySome) {
        modifiedFields.push('prioritySome')
      }
      if (modifiedFields.length === 0) {
        newSgSgIcmpRules[index] = { ...values }
        newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
          ...values,
        }
      } else {
        newSgSgIcmpRules[index] = {
          ...values,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
        newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
          ...values,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
      }
    }
    setRules(newSgSgIcmpRules)
    setRulesOtherside(newSgSgIcmpRulesOtherside)
    toggleEditPopover(index)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (oldValues: TFormSgSgIcmpRule) => {
    const newSgSgIcmpRules = [...rulesAll]
    const index = newSgSgIcmpRules.findIndex(
      ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
        sg === oldValues.sg &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    const newSgSgIcmpRulesOtherside = [...rulesOtherside]
    const newSgSgSgIcmpRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
        sg === centerSg &&
        IPv === newSgSgIcmpRules[index].IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(newSgSgIcmpRules[index].types.sort()) &&
        logs === newSgSgIcmpRules[index].logs &&
        trace === newSgSgIcmpRules[index].trace &&
        action === newSgSgIcmpRules[index].action &&
        prioritySome === newSgSgIcmpRules[index].prioritySome,
    )
    const newEditOpenRules = [...editOpen]
    if (newSgSgIcmpRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newSgSgIcmpRules.slice(0, index), ...newSgSgIcmpRules.slice(index + 1)])
      setRulesOtherside([
        ...newSgSgIcmpRulesOtherside.slice(0, newSgSgSgIcmpRulesOthersideIndex),
        ...newSgSgIcmpRulesOtherside.slice(newSgSgSgIcmpRulesOthersideIndex + 1),
      ])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newSgSgIcmpRules[index] = { ...newSgSgIcmpRules[index], formChanges: { status: STATUSES.deleted } }
      newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
        ...newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex],
        formChanges: { status: STATUSES.deleted },
      }
      setRules(newSgSgIcmpRules)
      setRulesOtherside(newSgSgIcmpRulesOtherside)
      toggleEditPopover(index)
    }
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const restoreRule = (oldValues: TFormSgSgIcmpRule) => {
    const newSgSgIcmpRules = [...rulesAll]
    const index = newSgSgIcmpRules.findIndex(
      ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
        sg === oldValues.sg &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    const newSgSgIcmpRulesOtherside = [...rulesOtherside]
    const newSgSgSgIcmpRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
        sg === centerSg &&
        IPv === newSgSgIcmpRules[index].IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(newSgSgIcmpRules[index].types.sort()) &&
        logs === newSgSgIcmpRules[index].logs &&
        trace === newSgSgIcmpRules[index].trace &&
        action === newSgSgIcmpRules[index].action &&
        prioritySome === newSgSgIcmpRules[index].prioritySome,
    )
    newSgSgIcmpRules[index] = { ...newSgSgIcmpRules[index], formChanges: { status: STATUSES.modified }, checked: false }
    newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex] = {
      ...newSgSgIcmpRulesOtherside[newSgSgSgIcmpRulesOthersideIndex],
      formChanges: { status: STATUSES.modified },
      checked: false,
    }
    setRules(newSgSgIcmpRules)
    setRulesOtherside(newSgSgIcmpRulesOtherside)
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  type TColumn = TFormSgSgIcmpRule & { key: string }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
      width: 25,
      render: (_, { action, formChanges }) => (
        <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('action')} className="no-scroll">
          {action === 'ACCEPT' ? (
            <LikeOutlined style={{ color: 'green' }} />
          ) : (
            <DislikeOutlined style={{ color: 'red' }} />
          )}
        </Styled.RulesEntryPorts>
      ),
    },
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
          <ShortenedTextWithTooltip text={sg} />
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
          <ShortenedTextWithTooltip text={types.join(',')} />
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
      title: 'Priority',
      key: 'prioritySome',
      dataIndex: 'prioritySome',
      width: 25,
      render: (_, { prioritySome, formChanges }) => (
        <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('prioritySome')} className="no-scroll">
          {prioritySome || DEFAULT_PRIORITIES.sgToSgIcmp}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 50,
      render: (_, oldValues, index) => (
        <>
          {isRestoreButtonActive && (
            <Styled.EditButton onClick={() => restoreRule(oldValues)}>Restore</Styled.EditButton>
          )}
          <Popover
            content={
              <EditSgSgIcmpPopover
                sgNames={sgNames}
                values={oldValues}
                remove={() => removeRule(oldValues)}
                hide={() => toggleEditPopover(index)}
                edit={values => editRule(oldValues, values)}
                isDisabled={isDisabled}
              />
            }
            title="SG SG ICMP"
            trigger="click"
            open={editOpen[index]}
            onOpenChange={() => toggleEditPopover(index)}
            placement={popoverPosition}
            className="no-scroll"
          >
            <Styled.EditButton>Edit</Styled.EditButton>
          </Popover>
        </>
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
                ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
                  sg === newRow.sg &&
                  IPv === newRow.IPv &&
                  JSON.stringify(types.sort()) === JSON.stringify(newRow.types.sort()) &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  action === newRow.action &&
                  prioritySome === newRow.prioritySome,
              ),
            )
          const uncheckedIndexes = dataSource
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
                  sg === newRow.sg &&
                  IPv === newRow.IPv &&
                  JSON.stringify(types.sort()) === JSON.stringify(newRow.types.sort()) &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  action === newRow.action &&
                  prioritySome === newRow.prioritySome,
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
            ({ sg, IPv, types, logs, trace, action, prioritySome }) =>
              sg === record.sg &&
              IPv === record.IPv &&
              JSON.stringify(types.sort()) === JSON.stringify(record.types.sort()) &&
              logs === record.logs &&
              trace === record.trace &&
              record.action === action &&
              record.prioritySome === prioritySome,
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
