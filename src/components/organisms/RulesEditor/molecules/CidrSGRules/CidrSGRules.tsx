/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined, CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import ipRangeCheck from 'ip-range-check'
import { TitleWithNoTopMargin } from 'components/atoms'
import { ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormCidrSgRule, TTraffic } from 'localTypes/rules'
import { AddCidrSgPopover, EditCidrSgPopover } from '../../atoms'
import { Styled } from '../styled'

type TCidrSGRulesProps = {
  title: string
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rules: TFormCidrSgRule[]
  setRules: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  isDisabled?: boolean
}

export const CidrSGRules: FC<TCidrSGRulesProps> = ({
  title,
  popoverPosition,
  defaultTraffic,
  rules,
  setRules,
  isDisabled,
}) => {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    setEditOpen(Array(rules.filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted).length).fill(false))
  }, [rules])

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const toggleEditPopover = (index: number) => {
    const newEditOpen = [...editOpen]
    newEditOpen[index] = !newEditOpen[index]
    setEditOpen(newEditOpen)
  }

  const addNew = (values: TFormCidrSgRule) => {
    setRules([
      ...rules,
      {
        ...values,
        traffic: defaultTraffic,
        formChanges: {
          status: STATUSES.new,
        },
      },
    ])
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  const editRule = (index: number, values: TFormCidrSgRule) => {
    const newCidrSgRules = [...rules]
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

  const removeRule = (index: number) => {
    const newCidrSgRules = [...rules]
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
      render: (_, { transport }) => (
        <Styled.RulesEntryTransport $transport={transport} className="no-scroll">
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
      render: (_, { cidr }) => <Styled.RulesEntrySgs className="no-scroll">{cidr}</Styled.RulesEntrySgs>,
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
      render: (_, { logs }) => (
        <Styled.RulesEntryMarks className="no-scroll">
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
      render: (_, { trace }) => (
        <Styled.RulesEntryMarks className="no-scroll">
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
      render: (_, { portsSource }) => (
        <Styled.RulesEntryPorts className="no-scroll">
          {!portsSource || portsSource.length === 0 ? 'any' : portsSource}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Ports Dst',
      key: 'portsDestination',
      dataIndex: 'portsDestination',
      width: 50,
      render: (_, { portsDestination }) => (
        <Styled.RulesEntryPorts className="no-scroll">
          {!portsDestination || portsDestination.length === 0 ? 'any' : portsDestination}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 50,
      render: (_, __, index) => (
        <Popover
          content={
            <EditCidrSgPopover
              values={rules[index]}
              remove={() => removeRule(index)}
              hide={() => toggleEditPopover(index)}
              edit={values => editRule(index, values)}
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
          Edit
        </Popover>
      ),
    },
  ]

  return (
    <Styled.GroupRulesNode>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <Table
        pagination={{
          position: ['bottomCenter'],
          showQuickJumper: true,
          showSizeChanger: false,
          defaultPageSize: ITEMS_PER_PAGE_EDITOR,
        }}
        dataSource={rules
          .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
          .map(row => ({
            ...row,
            key: `${row.cidr.toLocaleString()}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
          }))}
        columns={columns}
        virtual
        scroll={{ x: 'max-content' }}
      />
      <Popover
        content={<AddCidrSgPopover hide={toggleAddPopover} addNew={addNew} />}
        title="SG"
        trigger="click"
        open={addOpen}
        onOpenChange={toggleAddPopover}
        placement={popoverPosition}
      >
        <Styled.FormItem>
          <Button type="dashed" block icon={<PlusOutlined />} disabled={isDisabled}>
            Add
          </Button>
        </Styled.FormItem>
      </Popover>
    </Styled.GroupRulesNode>
  )
}
