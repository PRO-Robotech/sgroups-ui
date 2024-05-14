/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getSgSgIcmpRules, removeSgSgIcmpRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgSgIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgSgIcmpRuleColumn = TSgSgIcmpRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TSgSgIcmpRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgSgIcmp: FC = () => {
  const [sgSgIcmpRules, setSgSgIcmpRules] = useState<TSgSgIcmpRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIcmp, setDeleteErrorSgSgIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenSgSgIcmp, setIsModalOpenSgSgIcmp] = useState<boolean>(false)
  const [pendingToDeleteSgSgIcmpRule, setPendingToDeleteSgSgIcmpRule] = useState<{ sgFrom: string; sgTo: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgSgIcmpRules()
      .then(({ data }) => {
        setIsLoading(false)
        setSgSgIcmpRules(data.rules)
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

  const removeSgSgIcmpRuleFromList = (sgFrom: string, sgTo: string) => {
    removeSgSgIcmpRule(sgFrom, sgTo)
      .then(() => {
        setSgSgIcmpRules([...sgSgIcmpRules].filter(el => el.SgFrom !== sgFrom || el.SgTo !== sgTo))
        setIsModalOpenSgSgIcmp(false)
        setPendingToDeleteSgSgIcmpRule(undefined)
        setDeleteErrorSgSgIcmp(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteErrorSgSgIcmp({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteErrorSgSgIcmp({ status: error.status })
        } else {
          setDeleteErrorSgSgIcmp({ status: 'Error while fetching' })
        }
      })
  }

  const openRemoveSgSgIcmpRuleModal = (sgFrom: string, sgTo: string) => {
    setPendingToDeleteSgSgIcmpRule({ sgFrom, sgTo })
    setIsModalOpenSgSgIcmp(true)
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

  const columnsSgSgIcmp: ColumnsType<TSgSgIcmpRuleColumn> = [
    {
      title: 'SG From',
      dataIndex: 'SgFrom',
      key: 'SgFrom',
      width: 150,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { SgFrom }) => SgFrom.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'SG To',
      dataIndex: 'SgTo',
      key: 'SgTo',
      width: 150,
    },
    {
      title: 'ICMP',
      dataIndex: 'ICMP',
      key: 'ICMP',
      width: 70,
      render: (_, { ICMP }) => <div>{ICMP.IPv}</div>,
    },
    {
      title: 'Types',
      dataIndex: 'ICMP',
      key: 'Types',
      width: 70,
      render: (_, { ICMP }) => <div>{ICMP.Types.join(',')}</div>,
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 150,
      render: (_, { logs }) => {
        return logs ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />
      },
    },
    {
      title: 'Trace',
      dataIndex: 'trace',
      key: 'trace',
      width: 150,
      render: (_, { trace }) => {
        return trace ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 25,
      render: (_, { action }) => {
        return action === 'ACCEPT' ? (
          <CheckOutlined style={{ color: 'green' }} />
        ) : (
          <CloseOutlined style={{ color: 'red' }} />
        )
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 25,
      render: (_, { priority }) => <div>{priority?.some}</div>,
    },
    {
      title: 'Controls',
      key: 'controls',
      width: 150,
      render: (_, record: TSgSgIcmpRule) => (
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.SgFrom}`)} />
          <DeleteOutlined onClick={() => openRemoveSgSgIcmpRuleModal(record.SgFrom, record.SgTo)} />
        </>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules:SG-SG-ICMP</TitleWithNoTopMargin>
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
        {!sgSgIcmpRules.length && !error && !isLoading && <Empty />}
        {sgSgIcmpRules.length > 0 && (
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
            dataSource={sgSgIcmpRules.map(row => ({ ...row, key: `${row.SgFrom}${row.SgTo}` }))}
            columns={columnsSgSgIcmp}
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
        title="Delete sgSgIcmp rule"
        open={isModalOpenSgSgIcmp}
        onOk={() =>
          pendingToDeleteSgSgIcmpRule &&
          removeSgSgIcmpRuleFromList(pendingToDeleteSgSgIcmpRule.sgFrom, pendingToDeleteSgSgIcmpRule.sgTo)
        }
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenSgSgIcmp(false)
          setDeleteErrorSgSgIcmp(undefined)
        }}
      >
        <p>
          Are you sure you want to delete sgSgIcmp rule: {pendingToDeleteSgSgIcmpRule?.sgFrom} -{' '}
          {pendingToDeleteSgSgIcmpRule?.sgTo}
        </p>
        {deleteErrorSgSgIcmp && (
          <Result status="error" title={deleteErrorSgSgIcmp.status} subTitle={deleteErrorSgSgIcmp.data?.message} />
        )}
      </Modal>
    </>
  )
}
