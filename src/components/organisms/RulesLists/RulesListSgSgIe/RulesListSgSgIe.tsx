/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getSgSgIeRules, removeSgSgIeRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgSgIeRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgSgIeRuleColumn = TSgSgIeRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TSgSgIeRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgSgIe: FC = () => {
  const [sgSgIeRules, setSgSgIeRules] = useState<TSgSgIeRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIe, setDeleteErrorSgSgIe] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenSgSgIe, setIsModalOpenSgSgIe] = useState<boolean>(false)
  const [pendingToDeleteSgSgIeRule, setPendingToDeleteSgSgIeRule] = useState<{ sgFrom: string; sgTo: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgSgIeRules()
      .then(({ data }) => {
        setIsLoading(false)
        setSgSgIeRules(data.rules)
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

  const removeSgSgIeRuleFromList = (sgFrom: string, sgTo: string) => {
    removeSgSgIeRule(sgFrom, sgTo)
      .then(() => {
        setSgSgIeRules([...sgSgIeRules].filter(el => el.SgLocal !== sgFrom || el.Sg !== sgTo))
        setIsModalOpenSgSgIe(false)
        setPendingToDeleteSgSgIeRule(undefined)
        setDeleteErrorSgSgIe(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteErrorSgSgIe({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteErrorSgSgIe({ status: error.status })
        } else {
          setDeleteErrorSgSgIe({ status: 'Error while fetching' })
        }
      })
  }

  const openRemoveSgSgIeRuleModal = (sgFrom: string, sgTo: string) => {
    setPendingToDeleteSgSgIeRule({ sgFrom, sgTo })
    setIsModalOpenSgSgIe(true)
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

  const columnsSgSgIe: ColumnsType<TSgSgIeRuleColumn> = [
    {
      title: 'SG',
      dataIndex: 'Sg',
      key: 'Sg',
      width: 150,
      filteredValue: filteredInfo.name || null,
    },
    {
      title: 'SG Local',
      dataIndex: 'SgLocal',
      key: 'SgLocal',
      width: 150,
    },
    {
      title: 'Ports',
      dataIndex: 'ports',
      key: 'ports',
      width: 70,
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
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 150,
      render: (_, { logs }) => <div>{logs ? 'true' : 'false'}</div>,
    },
    {
      title: 'Trace',
      dataIndex: 'trace',
      key: 'trace',
      width: 150,
      render: (_, { trace }) => <div>{trace ? 'true' : 'false'}</div>,
    },
    {
      title: 'Traffic',
      dataIndex: 'traffic',
      key: 'traffic',
      width: 150,
    },
    {
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 150,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 25,
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
      render: (_, record: TSgSgIeRule) => (
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.SgLocal}`)} />
          <DeleteOutlined onClick={() => openRemoveSgSgIeRuleModal(record.SgLocal, record.Sg)} />
        </>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: SG-SG-IE</TitleWithNoTopMargin>
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
        {!sgSgIeRules.length && !error && !isLoading && <Empty />}
        {sgSgIeRules.length > 0 && (
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
            dataSource={sgSgIeRules.map(row => ({ ...row, key: `${row.Sg}${row.SgLocal}` }))}
            columns={columnsSgSgIe}
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
        title="Delete sgSgIe rule"
        open={isModalOpenSgSgIe}
        onOk={() =>
          pendingToDeleteSgSgIeRule &&
          removeSgSgIeRuleFromList(pendingToDeleteSgSgIeRule.sgFrom, pendingToDeleteSgSgIeRule.sgTo)
        }
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenSgSgIe(false)
          setDeleteErrorSgSgIe(undefined)
        }}
      >
        <p>
          Are you sure you want to delete sgSgIe rule: {pendingToDeleteSgSgIeRule?.sgFrom} -{' '}
          {pendingToDeleteSgSgIeRule?.sgTo}
        </p>
        {deleteErrorSgSgIe && (
          <Result status="error" title={deleteErrorSgSgIe.status} subTitle={deleteErrorSgSgIe.data?.message} />
        )}
      </Modal>
    </>
  )
}
