/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Button, Popover, Tooltip, Table, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined, CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components'
import { ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormFqdnRule } from 'localTypes/rules'
import { AddFqdnPopover, EditFqdnPopover } from '../../atoms'
import { Styled } from '../styled'

type TFQDNRulesProps = {
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormFqdnRule[]
  setRules: Dispatch<SetStateAction<TFormFqdnRule[]>>
  isDisabled?: boolean
}

export const FQDNRules: FC<TFQDNRulesProps> = ({ title, popoverPosition, rules, setRules, isDisabled }) => {
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

  const addNew = (values: TFormFqdnRule) => {
    setRules([
      ...rules,
      {
        ...values,
        formChanges: {
          status: STATUSES.new,
        },
      },
    ])
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  const editRule = (index: number, values: TFormFqdnRule) => {
    const newFqdnRules = [...rules]
    if (newFqdnRules[index].formChanges?.status === STATUSES.new) {
      newFqdnRules[index] = { ...values, formChanges: { status: STATUSES.new } }
    } else {
      const modifiedFields = []
      if (JSON.stringify(newFqdnRules[index].fqdns) !== JSON.stringify(values.fqdns)) {
        modifiedFields.push('fqdns')
      }
      if (newFqdnRules[index].portsSource !== values.portsSource) {
        modifiedFields.push('portsSource')
      }
      if (newFqdnRules[index].portsDestination !== values.portsDestination) {
        modifiedFields.push('portsDestination')
      }
      if (newFqdnRules[index].transport !== values.transport) {
        modifiedFields.push('transport')
      }
      if (newFqdnRules[index].logs !== values.logs) {
        modifiedFields.push('logs')
      }
      if (modifiedFields.length === 0) {
        newFqdnRules[index] = { ...values }
      } else {
        newFqdnRules[index] = { ...values, formChanges: { status: STATUSES.modified, modifiedFields } }
      }
    }
    setRules(newFqdnRules)
    toggleEditPopover(index)
  }

  const removeRule = (index: number) => {
    const newFqdnRules = [...rules]
    const newEditOpenRules = [...editOpen]
    if (newFqdnRules[index].formChanges?.status === STATUSES.new) {
      setRules([...newFqdnRules.slice(0, index), ...newFqdnRules.slice(index + 1)])
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newFqdnRules[index] = { ...newFqdnRules[index], formChanges: { status: STATUSES.deleted } }
      setRules(newFqdnRules)
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

  type TColumn = TFormFqdnRule & { key: string }

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
      title: 'FQDNs',
      dataIndex: 'fqdns',
      key: 'fqdns',
      width: 150,
      render: (_, { fqdns }) => <Styled.RulesEntrySgs className="no-scroll">{fqdns.join(', ')}</Styled.RulesEntrySgs>,
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
      onFilter: (value, { fqdns }) =>
        fqdns
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
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
      title: 'Ports Source',
      key: 'portsSource',
      dataIndex: 'portsSource',
      width: 50,
      render: (_, { portsSource }) => (
        <Styled.RulesEntryPorts className="no-scroll">
          {portsSource.length === 0 ? 'any' : portsSource}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Ports Destination',
      key: 'portsDestination',
      dataIndex: 'portsDestination',
      width: 50,
      render: (_, { portsDestination }) => (
        <Styled.RulesEntryPorts className="no-scroll">
          {portsDestination.length === 0 ? 'any' : portsDestination}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 50,
      render: (_, { fqdns, logs, transport, portsSource, portsDestination }, index) => (
        <Popover
          content={
            <EditFqdnPopover
              values={{ fqdns, logs, transport, portsSource, portsDestination }}
              remove={() => removeRule(index)}
              hide={() => toggleEditPopover(index)}
              edit={values => editRule(index, values)}
              isDisabled={isDisabled}
            />
          }
          title="FQDN"
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
            key: `${row.fqdns.toLocaleString()}-${row.portsSource}-${row.portsDestination}-${row.transport}`,
          }))}
        columns={columns}
        virtual
        scroll={{ x: 'max-content' }}
      />
      <Popover
        content={<AddFqdnPopover hide={toggleAddPopover} addNew={addNew} />}
        title="FQDN"
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
