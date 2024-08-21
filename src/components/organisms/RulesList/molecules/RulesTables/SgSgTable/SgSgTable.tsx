/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, Key, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { Table, TableProps, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { TrashSimple, PencilSimpleLine } from '@phosphor-icons/react'
import { DEFAULT_PRIORITIES, STATUSES } from 'constants/rules'
import { TRulesTables, TFormSgSgRule } from 'localTypes/rules'
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
import { edit, remove, restore } from '../utils/editRemoveRestore/sgSg'
import { ActionCell, PortsCell, StatusCell } from '../atoms'
import { RULES_CONFIGS } from '../../../constants'
import { Styled } from '../styled'

type TSgSgTableProps = TRulesTables<TFormSgSgRule>

type TColumn = TFormSgSgRule & { key: string }

type OnChange = NonNullable<TableProps<TColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const SgSgTable: FC<TSgSgTableProps> = ({
  direction,
  isChangesMode,
  rulesData,
  isDisabled,
  isRestoreButtonActive,
}) => {
  const [api, contextHolder] = notification.useNotification()
  const dispatch = useDispatch()
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [editOpen, setEditOpen] = useState<TColumn | boolean>(false)
  const [deleteOpen, setDeleteOpen] = useState<TFormSgSgRule | boolean>(false)

  const searchText = useSelector((state: RootState) => state.searchText.searchText)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)

  const rulesAll = direction === 'from' ? rulesSgSgFrom : rulesSgSgTo
  const setRules = direction === 'from' ? setRulesSgSgFrom : setRulesSgSgTo
  const rulesOtherside = direction === 'from' ? rulesSgSgTo : rulesSgSgFrom
  const setRulesOtherside = direction === 'from' ? setRulesSgSgTo : setRulesSgSgFrom

  useEffect(() => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }, [searchText])

  useEffect(() => {
    if (!(rulesSgSgFrom.some(el => el.checked === true) || rulesSgSgTo.some(el => el.checked === true))) {
      setSelectedRowKeys([])
    }
  }, [rulesSgSgFrom, rulesSgSgTo])

  const openNotification = (msg: string) => {
    api.success({
      message: msg,
      placement: 'topRight',
    })
  }

  const editRule = (oldValues: TFormSgSgRule, values: TFormSgSgRule) => {
    edit(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues, values, openNotification)
  }

  const removeRule = (oldValues: TFormSgSgRule) => {
    remove(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues, openNotification)
  }

  const restoreRule = (oldValues: TFormSgSgRule) => {
    restore(dispatch, rulesAll, setRules, rulesOtherside, setRulesOtherside, centerSg, oldValues, openNotification)
  }

  const toggleLogs = (oldValues: TFormSgSgRule, logs: boolean) => {
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
      filteredValue: filteredInfo.name || null,
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
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 160,
      sorter: (a, b) => {
        if (a.transport === b.transport) {
          return 0
        }
        return a.transport === 'TCP' ? -1 : 1
      },
    },
    {
      title: 'Ports Source/Destination',
      key: 'ports',
      dataIndex: 'ports',
      width: 350,
      render: (_, { ports }) => <PortsCell ports={ports} />,
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
    <>
      <ThWhiteSpaceNoWrap>
        <TableComponents.TableContainerRules>
          <TableComponents.HideableControls>
            <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} {...defaultTableProps} />
          </TableComponents.HideableControls>
        </TableComponents.TableContainerRules>
      </ThWhiteSpaceNoWrap>
      <EditModal<TFormSgSgRule>
        direction={direction === 'from' ? 'Ingress' : 'Egress'}
        values={editOpen}
        hide={() => setEditOpen(false)}
        edit={values => {
          if (typeof editOpen !== 'boolean') {
            editRule(editOpen, values)
          }
        }}
        {...RULES_CONFIGS.sgSg}
        defaultPrioritySome={DEFAULT_PRIORITIES.sgToSg}
        isDisabled={isDisabled}
      />
      <DeleteOneModal<TFormSgSgRule>
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
