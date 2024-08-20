/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { Button, Popover, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, STATUSES } from 'constants/rules'
import { TRulesTables, TFormSgSgRule } from 'localTypes/rules'
import { EditPopover } from '../../../atoms'
import { getRowSelection, getDefaultTableProps } from '../utils'
import { edit, remove, restore } from '../utils/editRemoveRestore/sgSg'
import { FilterDropdown, ActionCell, LogsCell, TransportCell, PortsCell } from '../atoms'
import { RULES_CONFIGS } from '../../../constants'
import { Styled } from '../styled'

type TSgSgTableProps = TRulesTables<TFormSgSgRule>

type TColumn = TFormSgSgRule & { key: string }

export const SgSgTable: FC<TSgSgTableProps> = ({
  direction,
  isChangesMode,
  rulesData,
  isDisabled,
  isRestoreButtonActive,
}) => {
  const dispatch = useDispatch()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [editOpen, setEditOpen] = useState<boolean[]>([])

  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)

  const rulesAll = direction === 'from' ? rulesSgSgFrom : rulesSgSgTo
  const setRules = direction === 'from' ? setRulesSgSgFrom : setRulesSgSgTo
  const rulesOtherside = direction === 'from' ? rulesSgSgTo : rulesSgSgFrom
  const setRulesOtherside = direction === 'from' ? setRulesSgSgTo : setRulesSgSgFrom

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

  const editRule = (oldValues: TFormSgSgRule, values: TFormSgSgRule) => {
    edit(
      dispatch,
      rulesAll,
      setRules,
      rulesOtherside,
      setRulesOtherside,
      centerSg,
      oldValues,
      values,
      toggleEditPopover,
    )
  }

  const removeRule = (oldValues: TFormSgSgRule) => {
    remove(
      dispatch,
      rulesAll,
      setRules,
      rulesOtherside,
      setRulesOtherside,
      centerSg,
      oldValues,
      editOpen,
      setEditOpen,
      toggleEditPopover,
    )
  }

  const restoreRule = (oldValues: TFormSgSgRule) => {
    restore(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues)
  }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
      width: 25,
      render: (_, { action, formChanges }) => <ActionCell action={action} formChanges={formChanges} />,
    },
    {
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 50,
      render: (_, { transport, formChanges }) => <TransportCell transport={transport} formChanges={formChanges} />,
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
        <FilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
          close={close}
          setSearchText={setSearchText}
        />
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, { sg }) => sg.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 100,
      render: (_, { logs, formChanges }) => <LogsCell logs={logs} formChanges={formChanges} />,
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
          {!!prioritySome || prioritySome === 0 ? prioritySome : DEFAULT_PRIORITIES.sgToSg}
        </Styled.RulesEntryPorts>
      ),
    },
    {
      title: 'Ports',
      key: 'ports',
      dataIndex: 'ports',
      width: 50,
      render: (_, { ports, formChanges }) => (
        <PortsCell ports={ports} changesMarker="ports" formChanges={formChanges} />
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
          {!isRestoreButtonActive && (
            <Popover
              content={
                <EditPopover<TFormSgSgRule>
                  values={oldValues}
                  remove={() => removeRule(oldValues)}
                  hide={() => toggleEditPopover(index)}
                  edit={values => editRule(oldValues, values)}
                  {...RULES_CONFIGS.sgSg}
                  defaultPrioritySome={DEFAULT_PRIORITIES.sgToSg}
                  isDisabled={isDisabled}
                />
              }
              title="SG"
              trigger="click"
              open={editOpen[index]}
              onOpenChange={() => toggleEditPopover(index)}
              className="no-scroll"
            >
              <Button type="primary">Edit</Button>
            </Popover>
          )}
        </>
      ),
    },
  ]

  const dataSource = isChangesMode
    ? rulesData.map(row => ({
        ...row,
        key: `${row.sg}-${row.transport}`,
      }))
    : rulesData
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.sg}-${row.transport}`,
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

  const defaultTableProps = getDefaultTableProps()

  return (
    <ThWhiteSpaceNoWrap>
      <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} {...defaultTableProps} />
    </ThWhiteSpaceNoWrap>
  )
}
