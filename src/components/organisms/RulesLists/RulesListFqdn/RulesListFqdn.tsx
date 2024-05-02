/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getFqdnRules, removeFqdnRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TFqdnRule } from 'localTypes/rules'
import { Styled } from './styled'

export const RulesListFqdn: FC = () => {
  const [fqdnRules, setFqdnRules] = useState<TFqdnRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorFqdn, setDeleteErrorFqdn] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenFqdn, setIsModalOpenFqdn] = useState<boolean>(false)
  const [pendingToDeleteFqdnRule, setPendingToDeleteFqdnRule] = useState<{ sgFrom: string; fqdn: string }>()
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getFqdnRules()
      .then(({ data }) => {
        setIsLoading(false)
        setFqdnRules(data.rules)
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

  const removeFqdnRuleFromList = (sg: string, fqdn: string) => {
    removeFqdnRule(sg, fqdn)
      .then(() => {
        setFqdnRules([...fqdnRules].filter(el => el.sgFrom !== sg || el.FQDN !== fqdn))
        setIsModalOpenFqdn(false)
        setPendingToDeleteFqdnRule(undefined)
        setDeleteErrorFqdn(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteErrorFqdn({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteErrorFqdn({ status: error.status })
        } else {
          setDeleteErrorFqdn({ status: 'Error while fetching' })
        }
      })
  }

  const openRemoveFqdnRuleModal = (sgFrom: string, fqdn: string) => {
    setPendingToDeleteFqdnRule({ sgFrom, fqdn })
    setIsModalOpenFqdn(true)
  }

  if (error) {
    return <Result status="error" title={error.status} subTitle={error.data?.message} />
  }
  if (isLoading) {
    return <Spin />
  }

  type TFqdnRuleColumn = TFqdnRule & {
    key: string
  }

  const columnsFqdn: ColumnsType<TFqdnRuleColumn> = [
    {
      title: 'SG From',
      dataIndex: 'sgFrom',
      key: 'sgFrom',
      width: 150,
    },
    {
      title: 'FQDN',
      dataIndex: 'FQDN',
      key: 'FQDN',
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
      render: (_, record: TFqdnRule) => (
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.sgFrom}`)} />
          <DeleteOutlined onClick={() => openRemoveFqdnRuleModal(record.sgFrom, record.FQDN)} />
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
        <TitleWithNoTopMargin level={4}>SG-to-FQDN Rules</TitleWithNoTopMargin>
        {!fqdnRules.length && !error && !isLoading && <Empty />}
        {fqdnRules.length > 0 && (
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
            dataSource={fqdnRules.map(row => ({ ...row, key: `${row.sgFrom}${row.FQDN}` }))}
            columns={columnsFqdn}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        )}
      </Card>
      <Modal
        title="Delete fqdn rule"
        open={isModalOpenFqdn}
        onOk={() =>
          pendingToDeleteFqdnRule &&
          removeFqdnRuleFromList(pendingToDeleteFqdnRule.sgFrom, pendingToDeleteFqdnRule.fqdn)
        }
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenFqdn(false)
          setDeleteErrorFqdn(undefined)
        }}
      >
        <p>
          Are you sure you want to delete fqdn rule: {pendingToDeleteFqdnRule?.sgFrom} - {pendingToDeleteFqdnRule?.fqdn}
        </p>
        {deleteErrorFqdn && (
          <Result status="error" title={deleteErrorFqdn.status} subTitle={deleteErrorFqdn.data?.message} />
        )}
      </Modal>
    </>
  )
}
