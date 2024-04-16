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
import { TFormSgSgIeRule, TTraffic } from 'localTypes/rules'
import { EditSgSgIePopover } from '../../../atoms'
import { Styled } from '../styled'

type TSgSgIeTableProps = {
  isChangesMode: boolean
  sgNames: string[]
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rulesData: TFormSgSgIeRule[]
  rulesAll: TFormSgSgIeRule[]
  setRules: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  isDisabled?: boolean
  forceArrowsUpdate?: () => void
}

export const SgSgIeTable: FC<TSgSgIeTableProps> = ({
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
  const editRule = (oldValues: TFormSgSgIeRule, values: TFormSgSgIeRule) => {
    const newSgSgIeRules = [...rulesAll]
    const index = newSgSgIeRules.findIndex(
      ({ sg, portsSource, portsDestination, logs, trace, traffic, transport }) =>
        sg === oldValues.sg &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        transport === oldValues.transport,
    )
    if (newSgSgIeRules[index].formChanges?.status === STATUSES.new) {
      newSgSgIeRules[index] = { ...values, traffic: defaultTraffic, formChanges: { status: STATUSES.new } }
    } else {
      const modifiedFields = []
      if (newSgSgIeRules[index].sg !== values.sg) {
        modifiedFields.push('sg')
      }
      if (newSgSgIeRules[index].portsSource !== values.portsSource) {
        modifiedFields.push('portsSource')
      }
      if (newSgSgIeRules[index].portsDestination !== values.portsDestination) {
        modifiedFields.push('portsDestination')
      }
      if (newSgSgIeRules[index].transport !== values.transport) {
        modifiedFields.push('transport')
      }
      if (newSgSgIeRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (modifiedFields.length === 0) {
        newSgSgIeRules[index] = { ...values }
      } else {
        newSgSgIeRules[index] = {
          ...values,
          traffic: defaultTraffic,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
      }
    }
    setRules(newSgSgIeRules)
    toggleEditPopover(index)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (oldValues: TFormSgSgIeRule) => {
    const newSgSgIeRules = [...rulesAll]
    const index = newSgSgIeRules.findIndex(
      ({ sg, portsSource, portsDestination, logs, trace, traffic, transport }) =>
        sg === oldValues.sg &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        transport === oldValues.transport,
    )
    const newEditOpenRules = [...editOpen]
    if (newSgSgIeRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newSgSgIeRules.slice(0, index), ...newSgSgIeRules.slice(index + 1)])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newSgSgIeRules[index] = {
        ...newSgSgIeRules[index],
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.deleted },
      }
      setRules(newSgSgIeRules)
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

  type TColumn = TFormSgSgIeRule & { key: string }

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
      title: 'SG Names',
      dataIndex: 'sgs',
      key: 'sgs',
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
      onFilter: (value, { sg }) => sg.toLowerCase().includes((value as string).toLowerCase()),
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
            <EditSgSgIePopover
              sgNames={sgNames}
              values={oldValues}
              remove={() => removeRule(oldValues)}
              hide={() => toggleEditPopover(index)}
              edit={values => editRule(oldValues, values)}
              isDisabled={isDisabled}
            />
          }
          title="SG-SG-IE"
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
        key: `${row.sg}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
      }))
    : rulesData
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.sg}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
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
                ({ sg, portsSource, portsDestination, logs, trace, traffic, transport }) =>
                  sg === newRow.sg &&
                  portsSource === newRow.portsSource &&
                  portsDestination === newRow.portsDestination &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  transport === newRow.transport,
              ),
            )
          const uncheckedIndexes = newSelectedRows
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ sg, portsSource, portsDestination, logs, trace, traffic, transport }) =>
                  sg === newRow.sg &&
                  portsSource === newRow.portsSource &&
                  portsDestination === newRow.portsDestination &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  transport === newRow.transport,
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
            ({ sg, portsSource, portsDestination, logs, trace, traffic, transport }) =>
              sg === record.sg &&
              portsSource === record.portsSource &&
              portsDestination === record.portsDestination &&
              logs === record.logs &&
              trace === record.trace &&
              traffic === record.traffic &&
              transport === record.transport,
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
