/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getSgSgIeIcmpRules, removeSgSgIeIcmpRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgSgIeIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

export const RulesListSgSgIeIcmp: FC = () => {
  const [sgSgIeIcmpRules, setSgSgIeIcmpRules] = useState<TSgSgIeIcmpRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIeIcmp, setDeleteErrorSgSgIeIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenSgSgIeIcmp, setIsModalOpenSgSgIeIcmp] = useState<boolean>(false)
  const [pendingToDeleteSgSgIeIcmpRule, setPendingToDeleteSgSgIeIcmpRule] = useState<{ sgFrom: string; sgTo: string }>()
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgSgIeIcmpRules()
      .then(({ data }) => {
        setIsLoading(false)
        setSgSgIeIcmpRules(data.rules)
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

  const removeSgSgIeIcmpRuleFromList = (sgFrom: string, sgTo: string) => {
    removeSgSgIeIcmpRule(sgFrom, sgTo)
      .then(() => {
        setSgSgIeIcmpRules([...sgSgIeIcmpRules].filter(el => el.SgLocal !== sgFrom || el.Sg !== sgTo))
        setIsModalOpenSgSgIeIcmp(false)
        setPendingToDeleteSgSgIeIcmpRule(undefined)
        setDeleteErrorSgSgIeIcmp(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteErrorSgSgIeIcmp({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteErrorSgSgIeIcmp({ status: error.status })
        } else {
          setDeleteErrorSgSgIeIcmp({ status: 'Error while fetching' })
        }
      })
  }

  const openRemoveSgSgIeIcmpRuleModal = (sgFrom: string, sgTo: string) => {
    setPendingToDeleteSgSgIeIcmpRule({ sgFrom, sgTo })
    setIsModalOpenSgSgIeIcmp(true)
  }

  if (error) {
    return <Result status="error" title={error.status} subTitle={error.data?.message} />
  }
  if (isLoading) {
    return <Spin />
  }

  type TSgSgIeIcmpRuleColumn = TSgSgIeIcmpRule & {
    key: string
  }

  const columnsSgSgIeIcmp: ColumnsType<TSgSgIeIcmpRuleColumn> = [
    {
      title: 'SG',
      dataIndex: 'Sg',
      key: 'Sg',
      width: 150,
    },
    {
      title: 'SG Local',
      dataIndex: 'SgLocal',
      key: 'SgLocal',
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
      title: 'Traffic',
      dataIndex: 'traffic',
      key: 'traffic',
      width: 150,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record: TSgSgIeIcmpRule) => (
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.SgLocal}`)} />
          <DeleteOutlined onClick={() => openRemoveSgSgIeIcmpRuleModal(record.SgLocal, record.Sg)} />
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
        <TitleWithNoTopMargin level={4}>SG-to-SG-ie-ICMP Rules</TitleWithNoTopMargin>
        {!sgSgIeIcmpRules.length && !error && !isLoading && <Empty />}
        {sgSgIeIcmpRules.length > 0 && (
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
            dataSource={sgSgIeIcmpRules.map(row => ({ ...row, key: `${row.Sg}${row.SgLocal}` }))}
            columns={columnsSgSgIeIcmp}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        )}
      </Card>
      <Modal
        title="Delete sgSgIeIcmp rule"
        open={isModalOpenSgSgIeIcmp}
        onOk={() =>
          pendingToDeleteSgSgIeIcmpRule &&
          removeSgSgIeIcmpRuleFromList(pendingToDeleteSgSgIeIcmpRule.sgFrom, pendingToDeleteSgSgIeIcmpRule.sgTo)
        }
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenSgSgIeIcmp(false)
          setDeleteErrorSgSgIeIcmp(undefined)
        }}
      >
        <p>
          Are you sure you want to delete sgSgIeIcmp rule: {pendingToDeleteSgSgIeIcmpRule?.sgFrom} -{' '}
          {pendingToDeleteSgSgIeIcmpRule?.sgTo}
        </p>
        {deleteErrorSgSgIeIcmp && (
          <Result status="error" title={deleteErrorSgSgIeIcmp.status} subTitle={deleteErrorSgSgIeIcmp.data?.message} />
        )}
      </Modal>
    </>
  )
}
