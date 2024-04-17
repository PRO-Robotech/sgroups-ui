/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps, TableRowSelection } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import ipRangeCheck from 'ip-range-check'
import { ThWhiteSpaceNoWrap } from 'components/atoms'
import { ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormCidrSgRule, TTraffic } from 'localTypes/rules'
import { EditCidrSgPopover } from '../../../atoms'
import { Styled } from '../styled'

type TCidrSgTableProps = {
  isChangesMode: boolean
  defaultTraffic: TTraffic
  rulesData: TFormCidrSgRule[]
  rulesAll: TFormCidrSgRule[]
  setRules: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  popoverPosition: TooltipPlacement
  isDisabled?: boolean
  forceArrowsUpdate?: () => void
}

export const CidrSgTable: FC<TCidrSgTableProps> = ({
  isChangesMode,
  defaultTraffic,
  rulesData,
  rulesAll,
  setRules,
  setEditOpen,
  editOpen,
  popoverPosition,
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

  const editRule = (oldValues: TFormCidrSgRule, values: TFormCidrSgRule) => {
    const newCidrSgRules = [...rulesAll]
    const index = newCidrSgRules.findIndex(
      ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination }) =>
        cidr === oldValues.cidr &&
        transport === oldValues.transport &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination,
    )
    if (newCidrSgRules[index].formChanges?.status === STATUSES.new) {
      newCidrSgRules[index] = { ...values, traffic: defaultTraffic, formChanges: { status: STATUSES.new } }
    } else {
      const modifiedFields = []
      if (newCidrSgRules[index].cidr !== values.cidr) {
        modifiedFields.push('cidr')
      }
      if (newCidrSgRules[index].portsSource !== values.portsSource) {
        modifiedFields.push('portsSource')
      }
      if (newCidrSgRules[index].portsDestination !== values.portsDestination) {
        modifiedFields.push('portsDestination')
      }
      if (newCidrSgRules[index].transport !== values.transport) {
        modifiedFields.push('transport')
      }
      if (newCidrSgRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (newCidrSgRules[index].trace !== values.trace) {
        modifiedFields.push('trace')
      }
      if (modifiedFields.length === 0) {
        newCidrSgRules[index] = { ...values, traffic: defaultTraffic }
      } else {
        newCidrSgRules[index] = {
          ...values,
          traffic: defaultTraffic,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
      }
    }
    setRules(newCidrSgRules)
    toggleEditPopover(index)
  }

  const removeRule = (oldValues: TFormCidrSgRule) => {
    const newCidrSgRules = [...rulesAll]
    const index = newCidrSgRules.findIndex(
      ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination }) =>
        cidr === oldValues.cidr &&
        transport === oldValues.transport &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination,
    )
    const newEditOpenRules = [...editOpen]
    if (newCidrSgRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newCidrSgRules.slice(0, index), ...newCidrSgRules.slice(index + 1)])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newCidrSgRules[index] = {
        ...newCidrSgRules[index],
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.deleted },
      }
      setRules(newCidrSgRules)
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

  type TColumn = TFormCidrSgRule & { key: string }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 50,
      render: (_, { transport, formChanges }) => (
        <Styled.RulesEntryTransport
          $transport={transport}
          $modified={formChanges?.modifiedFields?.includes('transport')}
          className="no-scroll"
        >
          {transport}
        </Styled.RulesEntryTransport>
      ),
      sorter: (a, b) => {
        if (a.transport === b.transport) {
          return 0
        }
        return a.transport === 'TCP' ? -1 : 1
      },
    },
    {
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
      width: 150,
      render: (_, { cidr, formChanges }) => (
        <Styled.RulesEntrySgs $modified={formChanges?.modifiedFields?.includes('cidr')} className="no-scroll">
          {cidr}
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
          <Tooltip title="Trace">
            {trace ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />}
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
      title: 'Ports Src',
      key: 'portsSource',
      dataIndex: 'portsSource',
      width: 50,
      render: (_, { portsSource, formChanges }) => (
        <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('portsSource')} className="no-scroll">
          {!portsSource || portsSource.length === 0 ? 'any' : portsSource}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Ports Dst',
      key: 'portsDestination',
      dataIndex: 'portsDestination',
      width: 50,
      render: (_, { portsDestination, formChanges }) => (
        <Styled.RulesEntryPorts
          $modified={formChanges?.modifiedFields?.includes('portsDestination')}
          className="no-scroll"
        >
          {!portsDestination || portsDestination.length === 0 ? 'any' : portsDestination}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 50,
      render: (_, oldValues, index) => (
        <Popover
          content={
            <EditCidrSgPopover
              values={oldValues}
              remove={() => removeRule(oldValues)}
              hide={() => toggleEditPopover(index)}
              edit={values => editRule(oldValues, values)}
              isDisabled={isDisabled}
            />
          }
          title="CIDR-SG"
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
        key: `${row.cidr.toLocaleString()}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
      }))
    : rulesData
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.cidr.toLocaleString()}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
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
                ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination }) =>
                  cidr === newRow.cidr &&
                  transport === newRow.transport &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  portsSource === newRow.portsSource &&
                  portsDestination === newRow.portsDestination,
              ),
            )
          const uncheckedIndexes = dataSource
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination }) =>
                  cidr === newRow.cidr &&
                  transport === newRow.transport &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  portsSource === newRow.portsSource &&
                  portsDestination === newRow.portsDestination,
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
            ({ cidr, transport, logs, trace, traffic, portsDestination, portsSource }) =>
              record.cidr === cidr &&
              record.transport === transport &&
              record.logs === logs &&
              record.trace === trace &&
              record.traffic === traffic &&
              record.portsDestination === portsDestination &&
              record.portsSource === portsSource,
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
        rowSelection={rowSelection}
      />
    </ThWhiteSpaceNoWrap>
  )
}
