/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getSgSgIcmpRules, removeSgSgIcmpRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgSgIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

export const RulesListSgSgIcmp: FC = () => {
  const [sgSgIcmpRules, setSgSgIcmpRules] = useState<TSgSgIcmpRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIcmp, setDeleteErrorSgSgIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenSgSgIcmp, setIsModalOpenSgSgIcmp] = useState<boolean>(false)
  const [pendingToDeleteSgSgIcmpRule, setPendingToDeleteSgSgIcmpRule] = useState<{ sgFrom: string; sgTo: string }>()
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

  type TSgSgIcmpRuleColumn = TSgSgIcmpRule & {
    key: string
  }

  const columnsSgSgIcmp: ColumnsType<TSgSgIcmpRuleColumn> = [
    {
      title: 'SG From',
      dataIndex: 'SgFrom',
      key: 'SgFrom',
      width: 150,
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
      title: 'Action',
      key: 'action',
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
        <TitleWithNoTopMargin level={2}>Rules</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Button type="primary" onClick={() => history.push('/rules/editor')}>
          Editor
        </Button>
        <Spacer $space={25} $samespace />
        <TitleWithNoTopMargin level={4}>SG-to-SG-ICMP Rules</TitleWithNoTopMargin>
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
