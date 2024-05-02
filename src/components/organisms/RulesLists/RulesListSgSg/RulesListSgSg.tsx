/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getRules, removeRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgRule } from 'localTypes/rules'
import { Styled } from './styled'

export const RulesListSgSg: FC = () => {
  const [rules, setRules] = useState<TSgRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pendingToDeleteRule, setPendingToDeleteRule] = useState<{ sgFrom: string; sgTo: string }>()
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

  type TSgRuleColumn = TSgRule & {
    key: string
  }

  const columns: ColumnsType<TSgRuleColumn> = [
    {
      title: 'SG From',
      dataIndex: 'sgFrom',
      key: 'sgFrom',
      width: 150,
    },
    {
      title: 'SG To',
      dataIndex: 'sgTo',
      key: 'sgTo',
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
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 150,
    },
    {
      title: 'Action',
      key: 'action',
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
        <TitleWithNoTopMargin level={2}>Rules</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Button type="primary" onClick={() => history.push('/rules/editor')}>
          Editor
        </Button>
        <Spacer $space={25} $samespace />
        <TitleWithNoTopMargin level={4}>SG Rules</TitleWithNoTopMargin>
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
