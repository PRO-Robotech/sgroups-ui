/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { Button, Popover, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import { ShortenedTextWithTooltip, ThWhiteSpaceNoWrap } from 'components/atoms'
import { DEFAULT_PRIORITIES, STATUSES } from 'constants/rules'
import { TRulesTables, TFormSgSgIcmpRule } from 'localTypes/rules'
import { EditPopover } from '../../../atoms'
import { getRowSelection, getDefaultTableProps } from '../utils'
import { edit, remove, restore } from '../utils/editRemoveRestore/sgSgIcmp'
import { FilterDropdown, ActionCell, LogsCell, TraceCell } from '../atoms'
import { RULES_CONFIGS } from '../../../constants'
import { Styled } from '../styled'

type TSgSgIcmpTableProps = TRulesTables<TFormSgSgIcmpRule>

type TColumn = TFormSgSgIcmpRule & { key: string }

export const SgSgIcmpTable: FC<TSgSgIcmpTableProps> = ({
  direction,
  isChangesMode,
  popoverPosition,
  rulesData,
  isDisabled,
  isRestoreButtonActive,
  forceArrowsUpdate,
}) => {
  const dispatch = useDispatch()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [editOpen, setEditOpen] = useState<boolean[]>([])

  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)

  const rulesAll = direction === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo
  const setRules = direction === 'from' ? setRulesSgSgIcmpFrom : setRulesSgSgIcmpTo
  const rulesOtherside = direction === 'from' ? rulesSgSgIcmpTo : rulesSgSgIcmpFrom
  const setRulesOtherside = direction === 'from' ? setRulesSgSgIcmpTo : setRulesSgSgIcmpFrom

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
  const editRule = (oldValues: TFormSgSgIcmpRule, values: TFormSgSgIcmpRule) => {
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

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (oldValues: TFormSgSgIcmpRule) => {
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

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const restoreRule = (oldValues: TFormSgSgIcmpRule) => {
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
      title: 'SG Name',
      dataIndex: 'sg',
      key: 'sg',
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
      onFilter: (value, { sg }) =>
        sg
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
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
      render: (_, { logs, formChanges }) => <LogsCell logs={logs} formChanges={formChanges} />,
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
      render: (_, { trace, formChanges }) => <TraceCell trace={trace} formChanges={formChanges} />,
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
          {!!prioritySome || prioritySome === 0 ? prioritySome : DEFAULT_PRIORITIES.sgToSgIcmp}
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
              <EditPopover<TFormSgSgIcmpRule>
                values={oldValues}
                remove={() => removeRule(oldValues)}
                hide={() => toggleEditPopover(index)}
                edit={values => editRule(oldValues, values)}
                {...RULES_CONFIGS.sgSgIcmp}
                defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIcmp}
                isDisabled={isDisabled}
              />
            }
            title="SG SG ICMP"
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
        key: `${row.sg}-${row.IPv}`,
      }))
    : rulesData
        .filter(({ formChanges }) => formChanges?.status !== STATUSES.deleted)
        .map(row => ({
          ...row,
          key: `${row.sg}-${row.IPv}`,
        }))

  const rowSelection = getRowSelection<TFormSgSgIcmpRule, TColumn>(
    dispatch,
    isChangesMode,
    selectedRowKeys,
    dataSource,
    setRules,
    rulesAll,
    setSelectedRowKeys,
  )

  const defaultTableProps = getDefaultTableProps(forceArrowsUpdate)

  return (
    <ThWhiteSpaceNoWrap>
      <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} {...defaultTableProps} />
    </ThWhiteSpaceNoWrap>
  )
}
