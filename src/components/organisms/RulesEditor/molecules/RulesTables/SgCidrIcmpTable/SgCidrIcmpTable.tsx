/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import ipRangeCheck from 'ip-range-check'
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormSgCidrIcmpRule, TTraffic } from 'localTypes/rules'
import { EditSgCidrIcmpPopover } from '../../../atoms'
import { getRowSelection } from '../utils'
import { Styled } from '../styled'

type TSgCidrIcmpTableProps = {
  isChangesMode: boolean
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rulesData: TFormSgCidrIcmpRule[]
  rulesAll: TFormSgCidrIcmpRule[]
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  isDisabled?: boolean
  isRestoreButtonActive?: boolean
  forceArrowsUpdate?: () => void
}

export const SgCidrIcmpTable: FC<TSgCidrIcmpTableProps> = ({
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

  const editRule = (oldValues: TFormSgCidrIcmpRule, values: TFormSgCidrIcmpRule) => {
    const newCidrSgIcmpRules = [...rulesAll]
    const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
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
    dispatch(setRules(newCidrSgIcmpRules))
    toggleEditPopover(index)
  }

  const removeRule = (oldValues: TFormSgCidrIcmpRule) => {
    const newCidrSgIcmpRules = [...rulesAll]
    const newEditOpenRules = [...editOpen]
    const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
    if (newCidrSgIcmpRules[index].formChanges?.status === STATUSES.new) {
      dispatch(setRules([...newCidrSgIcmpRules.slice(0, index), ...newCidrSgIcmpRules.slice(index + 1)]))
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newCidrSgIcmpRules[index] = {
        ...newCidrSgIcmpRules[index],
        traffic: defaultTraffic,
        formChanges: { status: STATUSES.deleted },
      }
      dispatch(setRules(newCidrSgIcmpRules))
      toggleEditPopover(index)
    }
  }

  const restoreRule = (oldValues: TFormSgCidrIcmpRule) => {
    const newCidrSgIcmpRules = [...rulesAll]
    const index = newCidrSgIcmpRules.findIndex(({ id }) => id === oldValues.id)
    newCidrSgIcmpRules[index] = {
      ...newCidrSgIcmpRules[index],
      traffic: defaultTraffic,
      formChanges: { status: STATUSES.modified },
      checked: false,
    }
    dispatch(setRules(newCidrSgIcmpRules))
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  type TColumn = TFormSgCidrIcmpRule & { key: string }

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
          {prioritySome || DEFAULT_PRIORITIES.sgToCidrIeIcmp}
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
              <EditSgCidrIcmpPopover
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
            <Button type="primary">Edit</Button>
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

  const rowSelection = getRowSelection<TFormSgCidrIcmpRule, TColumn>(
    dispatch,
    isChangesMode,
    selectedRowKeys,
    dataSource,
    setRules,
    rulesAll,
    setSelectedRowKeys,
  )

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
