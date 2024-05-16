/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  LikeOutlined,
  DislikeOutlined,
} from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getRules, removeRule } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgRuleColumn = TSgRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TSgRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgSg: FC = () => {
  const [rules, setRules] = useState<TSgRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pendingToDeleteRule, setPendingToDeleteRule] = useState<{ sgFrom: string; sgTo: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getRules()
      .then(({ data }) => {
        setIsLoading(false)
        setRules(data.rules)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setError({ status: error.status })
        } else {
          setError({ status: 'Error while fetching' })
        }
      })
  }, [])

  const removeRuleFromList = (sgFrom: string, sgTo: string) => {
    removeRule(sgFrom, sgTo)
      .then(() => {
        setRules([...rules].filter(el => el.sgFrom !== sgFrom || el.sgTo !== sgTo))
        setIsModalOpen(false)
        setPendingToDeleteRule(undefined)
        setDeleteError(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteError({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteError({ status: error.status })
        } else {
          setDeleteError({ status: 'Error while fetching' })
        }
      })
  }

  const openRemoveRuleModal = (sgFrom: string, sgTo: string) => {
    setPendingToDeleteRule({ sgFrom, sgTo })
    setIsModalOpen(true)
  }

  if (error) {
    return <Result status="error" title={error.status} subTitle={error.data?.message} />
  }

  if (isLoading) {
    return <Spin />
  }

  const handleSearch = (searchText: string) => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }

  const columns: ColumnsType<TSgRuleColumn> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_, { action }) => {
        return action === 'ACCEPT' ? (
          <LikeOutlined style={{ color: 'green' }} />
        ) : (
          <DislikeOutlined style={{ color: 'red' }} />
        )
      },
    },
    {
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 50,
    },
    {
      title: 'SG From',
      dataIndex: 'sgFrom',
      key: 'sgFrom',
      width: 150,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { sgFrom }) => sgFrom.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'SG To',
      dataIndex: 'sgTo',
      key: 'sgTo',
      width: 150,
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 50,
      render: (_, { logs }) => {
        return logs ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 50,
      render: (_, { priority }) => priority?.some || DEFAULT_PRIORITIES.sgToSg,
    },
    {
      title: 'Ports',
      dataIndex: 'ports',
      key: 'ports',
      width: 100,
      render: (_, { ports }) => (
        <Styled.PortsContainer>
          {ports.length === 0 ? (
            <div>any : any</div>
          ) : (
            ports.map(({ s, d }) => <div key={`${s}-${d}`}>{`${s || 'any'} : ${d || 'any'}`}</div>)
          )}
        </Styled.PortsContainer>
      ),
    },
    {
      title: 'Controls',
      key: 'controls',
      width: 150,
      render: (_, record: TSgRule) => (
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.sgFrom}`)} />
          <DeleteOutlined onClick={() => openRemoveRuleModal(record.sgFrom, record.sgTo)} />
        </>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: SG-SG</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Styled.FiltersContainer>
          <div>
            <Input
              allowClear
              placeholder="Filter by SG name"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={() => handleSearch(searchText)}
            />
          </div>
          <div>
            <Styled.ButtonWithMarginLeft
              onClick={() => handleSearch(searchText)}
              icon={<SearchOutlined />}
              type="primary"
            />
          </div>
        </Styled.FiltersContainer>
        <Spacer $space={15} $samespace />
        {!rules.length && !error && !isLoading && <Empty />}
        {rules.length > 0 && (
          <Table
            pagination={{
              position: ['bottomCenter'],
              showQuickJumper: {
                goButton: <Styled.ButtonWithMarginLeft size="small">Go</Styled.ButtonWithMarginLeft>,
              },
              showSizeChanger: false,
              defaultPageSize: ITEMS_PER_PAGE,
              hideOnSinglePage: true,
            }}
            dataSource={rules.map(row => ({ ...row, key: `${row.sgFrom}${row.sgTo}` }))}
            columns={columns}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        )}
        <Spacer $space={15} $samespace />
        <Button type="primary" onClick={() => history.push('/rules/editor')}>
          Add
        </Button>
      </Card>
      <Modal
        title="Delete rule"
        open={isModalOpen}
        onOk={() => pendingToDeleteRule && removeRuleFromList(pendingToDeleteRule.sgFrom, pendingToDeleteRule.sgTo)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpen(false)
          setDeleteError(undefined)
        }}
      >
        <p>
          Are you sure you want to delete rule: {pendingToDeleteRule?.sgFrom} - {pendingToDeleteRule?.sgTo}
        </p>
        {deleteError && <Result status="error" title={deleteError.status} subTitle={deleteError.data?.message} />}
      </Modal>
    </>
  )
}
