/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps, TableRowSelection } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { ThWhiteSpaceNoWrap } from 'components/atoms'
import { ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormSgRule } from 'localTypes/rules'
import { EditSGPopover } from '../../../atoms'
import { Styled } from '../styled'

type TSGTableProps = {
  isChangesMode: boolean
  sgNames: string[]
  rules: TFormSgRule[]
  setRules: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesOtherside: TFormSgRule[]
  setRulesOtherside: Dispatch<SetStateAction<TFormSgRule[]>>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  popoverPosition: TooltipPlacement
  centerSg?: string
  isDisabled?: boolean
  forceArrowsUpdate?: () => void
}

export const SGTable: FC<TSGTableProps> = ({
  isChangesMode,
  sgNames,
  rules,
  setRules,
  rulesOtherside,
  setRulesOtherside,
  setEditOpen,
  editOpen,
  popoverPosition,
  centerSg,
  isDisabled,
  forceArrowsUpdate,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    setEditOpen(Array(rules.filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted).length).fill(false))
  }, [rules, setEditOpen])

  const toggleEditPopover = (index: number) => {
    const newEditOpen = [...editOpen]
    newEditOpen[index] = !newEditOpen[index]
    setEditOpen(newEditOpen)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const editRule = (oldValues: TFormSgRule, values: TFormSgRule) => {
    const newSgRules = [...rules]
    const index = newSgRules.findIndex(
      ({ sg, portsSource, portsDestination, transport, logs }) =>
        sg === oldValues.sg &&
        portsSource === oldValues.portsSource &&
        portsDestination === oldValues.portsDestination &&
        transport === oldValues.transport &&
        logs === oldValues.logs,
    )
    const newSgRulesOtherside = [...rulesOtherside]
    const newSgRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, portsSource, portsDestination, transport, logs }) =>
        sg === centerSg &&
        portsSource === newSgRules[index].portsSource &&
        portsDestination === newSgRules[index].portsDestination &&
        transport === newSgRules[index].transport &&
        logs === newSgRules[index].logs,
    )
    if (newSgRules[index].formChanges?.status === STATUSES.new) {
      newSgRules[index] = { ...values, formChanges: { status: STATUSES.new } }
      newSgRulesOtherside[newSgRulesOthersideIndex] = { ...values, formChanges: { status: STATUSES.new } }
    } else {
      const modifiedFields = []
      if (newSgRules[index].sg !== values.sg) {
        modifiedFields.push('sg')
      }
      if (newSgRules[index].portsSource !== values.portsSource) {
        modifiedFields.push('portsSource')
      }
      if (newSgRules[index].portsDestination !== values.portsDestination) {
        modifiedFields.push('portsDestination')
      }
      if (newSgRules[index].transport !== values.transport) {
        modifiedFields.push('transport')
      }
      if (newSgRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (modifiedFields.length === 0) {
        newSgRules[index] = { ...values }
        newSgRulesOtherside[newSgRulesOthersideIndex] = { ...values }
      } else {
        newSgRules[index] = { ...values, formChanges: { status: STATUSES.modified, modifiedFields } }
        newSgRulesOtherside[newSgRulesOthersideIndex] = {
          ...values,
          formChanges: { status: STATUSES.modified, modifiedFields },
        }
      }
    }
    setRules(newSgRules)
    setRulesOtherside(newSgRulesOtherside)
    toggleEditPopover(index)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (index: number) => {
    const newSgRules = [...rules]
    const newSgRulesOtherside = [...rulesOtherside]
    const newSgRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, portsSource, portsDestination, transport, logs }) =>
        sg === centerSg &&
        portsSource === newSgRules[index].portsSource &&
        portsDestination === newSgRules[index].portsDestination &&
        transport === newSgRules[index].transport &&
        logs === newSgRules[index].logs,
    )
    const newEditOpenRules = [...editOpen]
    if (newSgRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newSgRules.slice(0, index), ...newSgRules.slice(index + 1)])
      setRulesOtherside([
        ...newSgRulesOtherside.slice(0, newSgRulesOthersideIndex),
        ...newSgRulesOtherside.slice(newSgRulesOthersideIndex + 1),
      ])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newSgRules[index] = { ...newSgRules[index], formChanges: { status: STATUSES.deleted } }
      newSgRulesOtherside[newSgRulesOthersideIndex] = {
        ...newSgRulesOtherside[newSgRulesOthersideIndex],
        formChanges: { status: STATUSES.deleted },
      }
      setRules(newSgRules)
      setRulesOtherside(newSgRulesOtherside)
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

  type TColumn = TFormSgRule & { key: string }

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
            <EditSGPopover
              sgNames={sgNames}
              values={rules[index]}
              remove={() => removeRule(index)}
              hide={() => toggleEditPopover(index)}
              edit={values => editRule(oldValues, values)}
              isDisabled={isDisabled}
            />
          }
          title="SG"
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
    ? rules.map(row => ({
        ...row,
        key: `${row.sg}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
      }))
    : rules
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.sg}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
        }))

  const rowSelection: TableRowSelection<TColumn> | undefined = isChangesMode
    ? {
        type: 'checkbox',
        onChange: (selectedRowKeys, _, info) => {
          const { type } = info
          if (type === 'all') {
            const checked = selectedRowKeys.length > 0
            const newRules = [...rules].map(el => ({ ...el, checked }))
            setRules(newRules)
          }
        },
        onSelect: (record: TColumn, selected: boolean) => {
          const newRules = [...rules]
          const pendingToCheckRuleIndex = newRules.findIndex(
            ({ sg, transport, logs, portsDestination, portsSource }) =>
              record.sg === sg &&
              record.transport === transport &&
              record.logs === logs &&
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
        size="small"
        rowSelection={rowSelection}
      />
    </ThWhiteSpaceNoWrap>
  )
}
