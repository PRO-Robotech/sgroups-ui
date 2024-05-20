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
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE_EDITOR, STATUSES } from 'constants/rules'
import { TFormSgSgRule } from 'localTypes/rules'
import { EditSgSgPopover } from '../../../atoms'
import { getRowSelection } from '../utils'
import { Styled } from '../styled'

type TSgSgTableProps = {
  isChangesMode: boolean
  rulesData: TFormSgSgRule[]
  rulesAll: TFormSgSgRule[]
  setRules: ActionCreatorWithPayload<TFormSgSgRule[]>
  rulesOtherside: TFormSgSgRule[]
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>
  setEditOpen: Dispatch<SetStateAction<boolean[]>>
  editOpen: boolean[]
  popoverPosition: TooltipPlacement
  centerSg?: string
  isDisabled?: boolean
  isRestoreButtonActive?: boolean
  forceArrowsUpdate?: () => void
}

export const SgSgTable: FC<TSgSgTableProps> = ({
  isChangesMode,
  rulesData,
  rulesAll,
  setRules,
  rulesOtherside,
  setRulesOtherside,
  setEditOpen,
  editOpen,
  popoverPosition,
  centerSg,
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

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const editRule = (oldValues: TFormSgSgRule, values: TFormSgSgRule) => {
    const newSgRules = [...rulesAll]
    const index = newSgRules.findIndex(({ id }) => id === oldValues.id)
    const newSgRulesOtherside = [...rulesOtherside]
    /* legacy */
    const newSgRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, portsSource, portsDestination, transport, logs, action, prioritySome }) =>
        sg === centerSg &&
        portsSource === newSgRules[index].portsSource &&
        portsDestination === newSgRules[index].portsDestination &&
        transport === newSgRules[index].transport &&
        logs === newSgRules[index].logs &&
        action === newSgRules[index].action &&
        prioritySome === newSgRules[index].prioritySome,
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
      if (newSgRules[index].action !== values.action) {
        modifiedFields.push('action')
      }
      if (newSgRules[index].prioritySome !== values.prioritySome) {
        modifiedFields.push('prioritySome')
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
    dispatch(setRules(newSgRules))
    dispatch(setRulesOtherside(newSgRulesOtherside))
    toggleEditPopover(index)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (oldValues: TFormSgSgRule) => {
    const newSgRules = [...rulesAll]
    const index = newSgRules.findIndex(({ id }) => id === oldValues.id)
    const newSgRulesOtherside = [...rulesOtherside]
    /* legacy */
    const newSgRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, portsSource, portsDestination, transport, logs, action, prioritySome }) =>
        sg === centerSg &&
        portsSource === newSgRules[index].portsSource &&
        portsDestination === newSgRules[index].portsDestination &&
        transport === newSgRules[index].transport &&
        logs === newSgRules[index].logs &&
        action === newSgRules[index].action &&
        prioritySome === newSgRules[index].prioritySome,
    )
    const newEditOpenRules = [...editOpen]
    if (newSgRules[index].formChanges?.status === STATUSES.new) {
      dispatch(setRules([...newSgRules.slice(0, index), ...newSgRules.slice(index + 1)]))
      dispatch(
        setRulesOtherside([
          ...newSgRulesOtherside.slice(0, newSgRulesOthersideIndex),
          ...newSgRulesOtherside.slice(newSgRulesOthersideIndex + 1),
        ]),
      )
      toggleEditPopover(index)
      setEditOpen([...newEditOpenRules.slice(0, index), ...newEditOpenRules.slice(index + 1)])
    } else {
      newSgRules[index] = { ...newSgRules[index], formChanges: { status: STATUSES.deleted } }
      newSgRulesOtherside[newSgRulesOthersideIndex] = {
        ...newSgRulesOtherside[newSgRulesOthersideIndex],
        formChanges: { status: STATUSES.deleted },
      }
      dispatch(setRules(newSgRules))
      dispatch(setRulesOtherside(newSgRulesOtherside))
      toggleEditPopover(index)
    }
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const restoreRule = (oldValues: TFormSgSgRule) => {
    const newSgRules = [...rulesAll]
    const index = newSgRules.findIndex(({ id }) => id === oldValues.id)
    const newSgRulesOtherside = [...rulesOtherside]
    /* legacy */
    const newSgRulesOthersideIndex = rulesOtherside.findIndex(
      ({ sg, portsSource, portsDestination, transport, logs, action, prioritySome }) =>
        sg === centerSg &&
        portsSource === newSgRules[index].portsSource &&
        portsDestination === newSgRules[index].portsDestination &&
        transport === newSgRules[index].transport &&
        logs === newSgRules[index].logs &&
        action === newSgRules[index].action &&
        prioritySome === newSgRules[index].prioritySome,
    )
    newSgRules[index] = { ...newSgRules[index], formChanges: { status: STATUSES.modified }, checked: false }
    newSgRulesOtherside[newSgRulesOthersideIndex] = {
      ...newSgRulesOtherside[newSgRulesOthersideIndex],
      formChanges: { status: STATUSES.modified },
      checked: false,
    }
    dispatch(setRules(newSgRules))
    dispatch(setRulesOtherside(newSgRulesOtherside))
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  type TColumn = TFormSgSgRule & { key: string }

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
      title: 'SG Names',
      dataIndex: 'sgs',
      key: 'sgs',
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
      onFilter: (value, { sg }) => sg.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 100,
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
      title: 'Priority',
      key: 'prioritySome',
      dataIndex: 'prioritySome',
      width: 25,
      render: (_, { prioritySome, formChanges }) => (
        <Styled.RulesEntryPorts $modified={formChanges?.modifiedFields?.includes('prioritySome')} className="no-scroll">
          {prioritySome || DEFAULT_PRIORITIES.sgToSg}
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
              <EditSgSgPopover
                values={oldValues}
                remove={() => removeRule(oldValues)}
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
            <Button type="primary">Edit</Button>
          </Popover>
        </>
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

  const rowSelection = getRowSelection<TFormSgSgRule, TColumn>(
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
