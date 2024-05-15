/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps, TableRowSelection } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import ipRangeCheck from 'ip-range-check'
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormCidrSgIcmpRule, TTraffic } from 'localTypes/rules'
import { EditCidrSgIcmpPopover } from '../../../atoms'
import { Styled } from '../styled'

type TCidrSgIcmpTableProps = {
  isChangesMode: boolean
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rulesData: TFormCidrSgIcmpRule[]
  rulesAll: TFormCidrSgIcmpRule[]
  setRules: Dispatch<SetStateAction<TFormCidrSgIcmpRule[]>>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  isDisabled?: boolean
  isRestoreButtonActive?: boolean
  forceArrowsUpdate?: () => void
}

export const CidrSgIcmpTable: FC<TCidrSgIcmpTableProps> = ({
  isChangesMode,
  popoverPosition,
  defaultTraffic,
  rulesData,
  rulesAll,
  setRules,
  setEditOpen,
  editOpen,
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

  const editRule = (oldValues: TFormCidrSgIcmpRule, values: TFormCidrSgIcmpRule) => {
    const newCidrSgIcmpRules = [...rulesAll]
    const index = newCidrSgIcmpRules.findIndex(
      ({ cidr, IPv, types, logs, trace, traffic, action, prioritySome }) =>
        cidr === oldValues.cidr &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    if (newCidrSgIcmpRules[index].formChanges?.status === STATUSES.new) {
      newCidrSgIcmpRules[index] = { ...values, traffic: defaultTraffic, formChanges: { status: STATUSES.new } }
    } else {
      const modifiedFields = []
      if (newCidrSgIcmpRules[index].cidr !== values.cidr) {
        modifiedFields.push('cidr')
      }
      if (newCidrSgIcmpRules[index].IPv !== values.IPv) {
        modifiedFields.push('ipv')
      }
      if (JSON.stringify(newCidrSgIcmpRules[index].types.sort()) !== JSON.stringify(values.types.sort())) {
        modifiedFields.push('types')
      }
      if (newCidrSgIcmpRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (newCidrSgIcmpRules[index].trace !== values.trace) {
        modifiedFields.push('trace')
      }
      if (newCidrSgIcmpRules[index].action !== values.action) {
        modifiedFields.push('action')
      }
      if (newCidrSgIcmpRules[index].prioritySome !== values.prioritySome) {
        modifiedFields.push('prioritySome')
      }
      if (modifiedFields.length === 0) {
        newCidrSgIcmpRules[index] = { ...values }
      } else {
        newCidrSgIcmpRules[index] = {
          ...values,
          traffic: defaultTraffic,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
      }
    }
    setRules(newCidrSgIcmpRules)
    toggleEditPopover(index)
  }

  const removeRule = (oldValues: TFormCidrSgIcmpRule) => {
    const newCidrSgIcmpRules = [...rulesAll]
    const newEditOpenRules = [...editOpen]
    const index = newCidrSgIcmpRules.findIndex(
      ({ cidr, IPv, types, logs, trace, traffic, action, prioritySome }) =>
        cidr === oldValues.cidr &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    if (newCidrSgIcmpRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newCidrSgIcmpRules.slice(0, index), ...newCidrSgIcmpRules.slice(index + 1)])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newCidrSgIcmpRules[index] = {
        ...newCidrSgIcmpRules[index],
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.deleted },
      }
      setRules(newCidrSgIcmpRules)
      toggleEditPopover(index)
    }
  }

  const restoreRule = (oldValues: TFormCidrSgIcmpRule) => {
    const newCidrSgIcmpRules = [...rulesAll]
    const index = newCidrSgIcmpRules.findIndex(
      ({ cidr, IPv, types, logs, trace, traffic, action, prioritySome }) =>
        cidr === oldValues.cidr &&
        IPv === oldValues.IPv &&
        JSON.stringify(types.sort()) === JSON.stringify(oldValues.types.sort()) &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    newCidrSgIcmpRules[index] = {
      ...newCidrSgIcmpRules[index],
      traffic: defaultTraffic,
      formChanges: { status: STATUSES.modified },
      checked: false,
    }
    setRules(newCidrSgIcmpRules)
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  type TColumn = TFormCidrSgIcmpRule & { key: string }

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
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
      width: 150,
      render: (_, { cidr, formChanges }) => (
        <Styled.RulesEntrySgs $modified={formChanges?.modifiedFields?.includes('cidr')} className="no-scroll">
          <ShortenedTextWithTooltip text={cidr} />
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
      onFilter: (value, { cidr }) => ipRangeCheck(value as string, cidr),
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
      title: 'Priority',
      key: 'prioritySome',
      dataIndex: 'prioritySome',
      width: 25,
      render: (_, { prioritySome, formChanges }) => (
        <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('prioritySome')} className="no-scroll">
          {prioritySome || DEFAULT_PRIORITIES.sgToCidrIeIcmp}
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
              <EditCidrSgIcmpPopover
                values={oldValues}
                remove={() => removeRule(oldValues)}
                hide={() => toggleEditPopover(index)}
                edit={values => editRule(oldValues, values)}
                isDisabled={isDisabled}
              />
            }
            title="CIDR-ICMP"
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
        key: `${row.cidr}-${row.IPv}`,
      }))
    : rulesData
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.cidr}-${row.IPv}`,
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
                ({ cidr, IPv, types, logs, trace, traffic, action, prioritySome }) =>
                  cidr === newRow.cidr &&
                  IPv === newRow.IPv &&
                  JSON.stringify(types.sort()) === JSON.stringify(newRow.types.sort()) &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  action === newRow.action &&
                  prioritySome === newRow.prioritySome,
              ),
            )
          const uncheckedIndexes = dataSource
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ cidr, IPv, types, logs, trace, traffic, action, prioritySome }) =>
                  cidr === newRow.cidr &&
                  IPv === newRow.IPv &&
                  JSON.stringify(types.sort()) === JSON.stringify(newRow.types.sort()) &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
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
            ({ cidr, IPv, types, logs, trace, traffic, action, prioritySome }) =>
              cidr === record.cidr &&
              IPv === record.IPv &&
              JSON.stringify(types.sort()) === JSON.stringify(record.types.sort()) &&
              logs === record.logs &&
              trace === record.trace &&
              traffic === record.traffic &&
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
