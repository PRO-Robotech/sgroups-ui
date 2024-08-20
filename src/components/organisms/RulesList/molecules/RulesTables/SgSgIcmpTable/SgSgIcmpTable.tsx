/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { Table, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import { TrashSimple, PencilSimpleLine } from '@phosphor-icons/react'
import { DEFAULT_PRIORITIES, STATUSES } from 'constants/rules'
import { TRulesTables, TFormSgSgIcmpRule } from 'localTypes/rules'
import {
  TextAlignContainer,
  TinyButtonInTableSmall,
  CustomMiddleSwitch,
  TableComponents,
  ShortenedTextWithTooltip,
  ThWhiteSpaceNoWrap,
} from 'components'
import { EditModal, DeleteOneModal } from '../../../atoms'
import { getRowSelection, getDefaultTableProps } from '../utils'
import { edit, remove, restore } from '../utils/editRemoveRestore/sgSgIcmp'
import { FilterDropdown, ActionCell, StatusCell } from '../atoms'
import { RULES_CONFIGS } from '../../../constants'
import { Styled } from '../styled'

type TSgSgIcmpTableProps = TRulesTables<TFormSgSgIcmpRule>

type TColumn = TFormSgSgIcmpRule & { key: string }

export const SgSgIcmpTable: FC<TSgSgIcmpTableProps> = ({
  direction,
  isChangesMode,
  rulesData,
  isDisabled,
  isRestoreButtonActive,
}) => {
  const [api, contextHolder] = notification.useNotification()
  const dispatch = useDispatch()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [editOpen, setEditOpen] = useState<TColumn | boolean>(false)
  const [deleteOpen, setDeleteOpen] = useState<TFormSgSgIcmpRule | boolean>(false)

  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)

  const rulesAll = direction === 'from' ? rulesSgSgIcmpFrom : rulesSgSgIcmpTo
  const setRules = direction === 'from' ? setRulesSgSgIcmpFrom : setRulesSgSgIcmpTo
  const rulesOtherside = direction === 'from' ? rulesSgSgIcmpTo : rulesSgSgIcmpFrom
  const setRulesOtherside = direction === 'from' ? setRulesSgSgIcmpTo : setRulesSgSgIcmpFrom

  useEffect(() => {
    if (!(rulesSgSgIcmpFrom.some(el => el.checked === true) || rulesSgSgIcmpTo.some(el => el.checked === true))) {
      setSelectedRowKeys([])
    }
  }, [rulesSgSgIcmpFrom, rulesSgSgIcmpTo])

  const openNotification = (msg: string) => {
    api.success({
      message: msg,
      placement: 'topRight',
    })
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const editRule = (oldValues: TFormSgSgIcmpRule, values: TFormSgSgIcmpRule) => {
    edit(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues, values, openNotification)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const removeRule = (oldValues: TFormSgSgIcmpRule) => {
    remove(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues, openNotification)
  }

  /* remove newSgRulesOtherside as legacy after only ie-sg-sg will remain */
  const restoreRule = (oldValues: TFormSgSgIcmpRule) => {
    restore(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues, openNotification)
  }

  const toggleLogs = (oldValues: TFormSgSgIcmpRule, logs: boolean) => {
    edit(
      dispatch,
      rulesAll,
      setRules,
      rulesOtherside,
      setRulesOtherside,
      centerSg,
      oldValues,
      { ...oldValues, logs },
      openNotification,
    )
  }

  const toggleTrace = (oldValues: TFormSgSgIcmpRule, trace: boolean) => {
    edit(
      dispatch,
      rulesAll,
      setRules,
      rulesOtherside,
      setRulesOtherside,
      centerSg,
      oldValues,
      { ...oldValues, trace },
      openNotification,
    )
  }

  const columns: ColumnsType<TColumn> = [
    ...(isChangesMode
      ? [
          {
            title: 'Status',
            dataIndex: 'formChanges',
            key: 'formChangesStatus',
            width: 100,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, values: TColumn) => <StatusCell status={values.formChanges?.status} />,
          },
        ]
      : []),
    {
      title: 'Security Groups',
      dataIndex: 'sg',
      key: 'sg',
      render: (_, { sg }) => (
        <Styled.RulesEntrySg className="no-scroll">
          <ShortenedTextWithTooltip text={sg} />
        </Styled.RulesEntrySg>
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
      title: 'Priority',
      key: 'prioritySome',
      dataIndex: 'prioritySome',
      width: 160,
      render: (_, { prioritySome }) => {
        if (!!prioritySome || prioritySome === 0) {
          return prioritySome
        }
        return DEFAULT_PRIORITIES.sgToSg
      },
    },
    {
      title: 'ICMP',
      dataIndex: 'IPv',
      key: 'IPv',
      width: 160,
      sorter: (a, b) => {
        if (a.IPv === b.IPv) {
          return 0
        }
        return a.IPv === 'IPv6' ? -1 : 1
      },
    },
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      width: 350,
      render: (_, { types }) => (
        <Styled.RulesEntryIcmpTypes className="no-scroll">
          <ShortenedTextWithTooltip text={types.join(',')} />
        </Styled.RulesEntryIcmpTypes>
      ),
      sorter: (a, b) => {
        if (a.types.length === b.types.length) {
          return 0
        }
        return a.types.length > b.types.length ? -1 : 1
      },
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
      width: 160,
      render: (_, { action }) => <ActionCell action={action} />,
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 160,
      render: (_, record) => (
        <CustomMiddleSwitch value={record.logs} onChange={checked => toggleLogs(record, checked)} />
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
      width: 160,
      render: (_, record) => (
        <CustomMiddleSwitch value={record.trace} onChange={checked => toggleTrace(record, checked)} />
      ),
      sorter: (a, b) => {
        if (a.trace === b.trace) {
          return 0
        }
        return a.trace ? -1 : 1
      },
    },
    {
      title: '',
      key: 'controls',
      align: 'right',
      className: 'controls',
      width: 84,
      render: (_, oldValues) => (
        <TextAlignContainer $align="right" className="hideable">
          <TinyButtonInTableSmall
            type="text"
            size="small"
            onClick={() => setEditOpen(oldValues)}
            icon={<PencilSimpleLine size={14} />}
          />
          {oldValues.formChanges?.status === 'deleted' && isRestoreButtonActive && (
            <TinyButtonInTableSmall
              type="text"
              size="small"
              onClick={() => restoreRule(oldValues)}
              icon={<TrashSimple size={14} />}
            />
          )}
          {oldValues.formChanges?.status !== 'deleted' && (
            <TinyButtonInTableSmall
              type="text"
              size="small"
              onClick={() => setDeleteOpen(oldValues)}
              icon={<TrashSimple size={14} />}
            />
          )}
        </TextAlignContainer>
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

  const defaultTableProps = getDefaultTableProps()

  return (
    <>
      <ThWhiteSpaceNoWrap>
        <TableComponents.TableContainerRules>
          <TableComponents.HideableControls>
            <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} {...defaultTableProps} />
          </TableComponents.HideableControls>
        </TableComponents.TableContainerRules>
      </ThWhiteSpaceNoWrap>
      <EditModal<TFormSgSgIcmpRule>
        direction={direction === 'from' ? 'Ingress' : 'Egress'}
        values={editOpen}
        hide={() => setEditOpen(false)}
        edit={values => {
          if (typeof editOpen !== 'boolean') {
            editRule(editOpen, values)
          }
        }}
        {...RULES_CONFIGS.sgSgIcmp}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSgIcmp}
        isDisabled={isDisabled}
      />
      <DeleteOneModal<TFormSgSgIcmpRule>
        values={deleteOpen}
        hide={() => setDeleteOpen(false)}
        remove={() => {
          if (typeof deleteOpen !== 'boolean') {
            removeRule(deleteOpen)
          }
        }}
      />
      {contextHolder}
    </>
  )
}
