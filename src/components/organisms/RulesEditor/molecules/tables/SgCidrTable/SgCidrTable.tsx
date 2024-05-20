/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps, TableRowSelection } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import ipRangeCheck from 'ip-range-check'
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormSgCidrRule, TTraffic } from 'localTypes/rules'
import { EditSgCidrPopover } from '../../../atoms'
import { Styled } from '../styled'

type TSgCidrTableProps = {
  isChangesMode: boolean
  defaultTraffic: TTraffic
  rulesData: TFormSgCidrRule[]
  rulesAll: TFormSgCidrRule[]
  setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  popoverPosition: TooltipPlacement
  isDisabled?: boolean
  isRestoreButtonActive?: boolean
  forceArrowsUpdate?: () => void
}

export const SgCidrTable: FC<TSgCidrTableProps> = ({
  isChangesMode,
  defaultTraffic,
  rulesData,
  rulesAll,
  setRules,
  setEditOpen,
  editOpen,
  popoverPosition,
  isDisabled,
  isRestoreButtonActive,
  forceArrowsUpdate,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const dispatch = useDispatch()

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

  const editRule = (oldValues: TFormSgCidrRule, values: TFormSgCidrRule) => {
    const newCidrSgRules = [...rulesAll]
    const index = newCidrSgRules.findIndex(
      ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination, action, prioritySome }) =>
        cidr === oldValues.cidr &&
        transport === oldValues.transport &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
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
      if (newCidrSgRules[index].action !== values.action) {
        modifiedFields.push('action')
      }
      if (newCidrSgRules[index].prioritySome !== values.prioritySome) {
        modifiedFields.push('prioritySome')
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
    dispatch(setRules(newCidrSgRules))
    toggleEditPopover(index)
  }

  const removeRule = (oldValues: TFormSgCidrRule) => {
    const newCidrSgRules = [...rulesAll]
    const index = newCidrSgRules.findIndex(
      ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination, action, prioritySome }) =>
        cidr === oldValues.cidr &&
        transport === oldValues.transport &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    const newEditOpenRules = [...editOpen]
    if (newCidrSgRules[index].formChanges?.status === STATUSES.new) {
      dispatch(setRules([...newCidrSgRules.slice(0, index), ...newCidrSgRules.slice(index + 1)]))
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newCidrSgRules[index] = {
        ...newCidrSgRules[index],
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.deleted },
      }
      dispatch(setRules(newCidrSgRules))
      toggleEditPopover(index)
    }
  }

  const restoreRule = (oldValues: TFormSgCidrRule) => {
    const newCidrSgRules = [...rulesAll]
    const index = newCidrSgRules.findIndex(
      ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination, action, prioritySome }) =>
        cidr === oldValues.cidr &&
        transport === oldValues.transport &&
        logs === oldValues.logs &&
        trace === oldValues.trace &&
        traffic === oldValues.traffic &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination &&
        action === oldValues.action &&
        prioritySome === oldValues.prioritySome,
    )
    newCidrSgRules[index] = {
      ...newCidrSgRules[index],
      traffic: defaultTraffic,
      formChanges: { status: STATUSES.modified },
      checked: false,
    }
    dispatch(setRules(newCidrSgRules))
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  type TColumn = TFormSgCidrRule & { key: string }

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
          {prioritySome || DEFAULT_PRIORITIES.sgToCidrIe}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Ports Src',
      key: 'portsSource',
      dataIndex: 'portsSource',
      width: 50,
      render: (_, { portsSource, formChanges }) => (
        <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('portsSource')} className="no-scroll">
          {!portsSource || portsSource.length === 0 ? 'any' : <ShortenedTextWithTooltip text={portsSource} />}
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
          {!portsDestination || portsDestination.length === 0 ? (
            'any'
          ) : (
            <ShortenedTextWithTooltip text={portsDestination} />
          )}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Controls',
      key: 'controls',
      width: 50,
      render: (_, oldValues, index) => (
        <>
          {isRestoreButtonActive && (
            <Button type="dashed" onClick={() => restoreRule(oldValues)}>
              Restore
            </Button>
          )}
          <Popover
            content={
              <EditSgCidrPopover
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
            <Button type="primary">Edit</Button>
          </Popover>
        </>
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
                ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination, action, prioritySome }) =>
                  cidr === newRow.cidr &&
                  transport === newRow.transport &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  portsSource === newRow.portsSource &&
                  portsDestination === newRow.portsDestination &&
                  action === newRow.action &&
                  prioritySome === newRow.prioritySome,
              ),
            )
          const uncheckedIndexes = dataSource
            .filter(({ key }) => uncheckedKeys.includes(key))
            .map(newRow =>
              rulesAll.findIndex(
                ({ cidr, transport, logs, trace, traffic, portsSource, portsDestination, action, prioritySome }) =>
                  cidr === newRow.cidr &&
                  transport === newRow.transport &&
                  logs === newRow.logs &&
                  trace === newRow.trace &&
                  traffic === newRow.traffic &&
                  portsSource === newRow.portsSource &&
                  portsDestination === newRow.portsDestination &&
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
          dispatch(setRules(newRules))
          setSelectedRowKeys(newSelectedRowKeys)
        },
        onSelect: (record: TColumn, selected: boolean) => {
          const newRules = [...rulesAll]
          const pendingToCheckRuleIndex = newRules.findIndex(
            ({ cidr, transport, logs, trace, traffic, portsDestination, portsSource, action, prioritySome }) =>
              record.cidr === cidr &&
              record.transport === transport &&
              record.logs === logs &&
              record.trace === trace &&
              record.traffic === traffic &&
              record.portsDestination === portsDestination &&
              record.portsSource === portsSource &&
              record.action === action &&
              record.prioritySome === prioritySome,
          )
          if (selected) {
            newRules[pendingToCheckRuleIndex] = { ...newRules[pendingToCheckRuleIndex], checked: true }
          } else {
            newRules[pendingToCheckRuleIndex] = { ...newRules[pendingToCheckRuleIndex], checked: false }
          }
          dispatch(setRules(newRules))
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
