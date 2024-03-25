/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Collapse, CollapseProps, Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import {
  getRules,
  removeRule,
  getFqdnRules,
  removeFqdnRule,
  getCidrSgRules,
  removeCidrSgRule,
  getSgSgIcmpRules,
  removeSgSgIcmpRule,
  getSgSgIeRules,
  removeSgSgIeRule,
} from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgRule, TFqdnRule, TCidrRule, TSgSgIcmpRule, TSgSgIeRule } from 'localTypes/rules'
import { Styled } from './styled'

export const RulesList: FC = () => {
  const [rules, setRules] = useState<TSgRule[]>([])
  const [fqdnRules, setFqdnRules] = useState<TFqdnRule[]>([])
  const [cidrRules, setCidrRules] = useState<TCidrRule[]>([])
  const [sgSgIcmpRules, setSgSgIcmpRules] = useState<TSgSgIcmpRule[]>([])
  const [sgSgIeRules, setSgSgIeRules] = useState<TSgSgIeRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [deleteErrorFqdn, setDeleteErrorFqdn] = useState<TRequestError | undefined>()
  const [deleteErrorCidr, setDeleteErrorCidr] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIcmp, setDeleteErrorSgSgIcmp] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIe, setDeleteErrorSgSgIe] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isModalOpenFqdn, setIsModalOpenFqdn] = useState<boolean>(false)
  const [isModalOpenCidr, setIsModalOpenCidr] = useState<boolean>(false)
  const [isModalOpenSgSgIcmp, setIsModalOpenSgSgIcmp] = useState<boolean>(false)
  const [isModalOpenSgSgIe, setIsModalOpenSgSgIe] = useState<boolean>(false)
  const [pendingToDeleteRule, setPendingToDeleteRule] = useState<{ sgFrom: string; sgTo: string }>()
  const [pendingToDeleteFqdnRule, setPendingToDeleteFqdnRule] = useState<{ sgFrom: string; fqdn: string }>()
  const [pendingToDeleteCidrRule, setPendingToDeleteCidrRule] = useState<{ sg: string; cidr: string }>()
  const [pendingToDeleteSgSgIcmpRule, setPendingToDeleteSgSgIcmpRule] = useState<{ sgFrom: string; sgTo: string }>()
  const [pendingToDeleteSgSgIeRule, setPendingToDeleteSgSgIeRule] = useState<{ sgFrom: string; sgTo: string }>()
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    Promise.all([getRules(), getFqdnRules(), getCidrSgRules(), getSgSgIcmpRules(), getSgSgIeRules()])
      .then(([value1, value2, value3, value4, value5]) => {
        setIsLoading(false)
        setRules(value1.data.rules)
        setFqdnRules(value2.data.rules)
        setCidrRules(value3.data.rules)
        setSgSgIcmpRules(value4.data.rules)
        setSgSgIeRules(value5.data.rules)
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

  const removeCidrRuleFromList = (sg: string, cidr: string) => {
    removeCidrSgRule(sg, cidr)
      .then(() => {
        setCidrRules([...cidrRules].filter(el => el.SG !== sg || el.CIDR !== cidr))
        setIsModalOpenCidr(false)
        setPendingToDeleteCidrRule(undefined)
        setDeleteErrorCidr(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteErrorCidr({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteErrorCidr({ status: error.status })
        } else {
          setDeleteErrorCidr({ status: 'Error while fetching' })
        }
      })
  }

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

  const openRemoveRuleModal = (sgFrom: string, sgTo: string) => {
    setPendingToDeleteRule({ sgFrom, sgTo })
    setIsModalOpen(true)
  }

  const openRemoveFqdnRuleModal = (sgFrom: string, fqdn: string) => {
    setPendingToDeleteFqdnRule({ sgFrom, fqdn })
    setIsModalOpenFqdn(true)
  }

  const openRemoveCidrRuleModal = (sg: string, cidr: string) => {
    setPendingToDeleteCidrRule({ sg, cidr })
    setIsModalOpenCidr(true)
  }

  const openRemoveSgSgIcmpRuleModal = (sgFrom: string, sgTo: string) => {
    setPendingToDeleteSgSgIcmpRule({ sgFrom, sgTo })
    setIsModalOpenSgSgIcmp(true)
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
        <DeleteOutlined onClick={() => openRemoveRuleModal(record.sgFrom, record.sgTo)} />
      ),
    },
  ]

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
        <DeleteOutlined onClick={() => openRemoveFqdnRuleModal(record.sgFrom, record.FQDN)} />
      ),
    },
  ]

  type TCidrRuleColumn = TCidrRule & {
    key: string
  }

  const columnsCidr: ColumnsType<TCidrRuleColumn> = [
    {
      title: 'SG',
      dataIndex: 'SG',
      key: 'SG',
      width: 150,
    },
    {
      title: 'CIDR',
      dataIndex: 'CIDR',
      key: 'CIDR',
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
      key: 'action',
      width: 150,
      render: (_, record: TCidrRule) => (
        <DeleteOutlined onClick={() => openRemoveCidrRuleModal(record.SG, record.CIDR)} />
      ),
    },
  ]

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
        <DeleteOutlined onClick={() => openRemoveSgSgIcmpRuleModal(record.SgFrom, record.SgTo)} />
      ),
    },
  ]

  type TSgSgIeRuleColumn = TSgSgIeRule & {
    key: string
  }

  const columnsSgSgIe: ColumnsType<TSgSgIeRuleColumn> = [
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
      key: 'action',
      width: 150,
      render: (_, record: TSgSgIeRule) => (
        <DeleteOutlined onClick={() => openRemoveSgSgIeRuleModal(record.SgLocal, record.Sg)} />
      ),
    },
  ]

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: <TitleWithNoTopMargin level={4}>SG Rules</TitleWithNoTopMargin>,
      children: (
        <>
          {!rules.length && !error && !isLoading && <Empty />}
          {rules.length > 0 && (
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: true,
                showSizeChanger: false,
                defaultPageSize: ITEMS_PER_PAGE,
              }}
              dataSource={rules.map(row => ({ ...row, key: `${row.sgFrom}${row.sgTo}` }))}
              columns={columns}
              scroll={{ x: 'max-content' }}
              size="small"
            />
          )}
        </>
      ),
    },
    {
      key: '2',
      label: <TitleWithNoTopMargin level={4}>SG-to-FQDN Rules</TitleWithNoTopMargin>,
      children: (
        <>
          {!fqdnRules.length && !error && !isLoading && <Empty />}
          {fqdnRules.length > 0 && (
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: true,
                showSizeChanger: false,
                defaultPageSize: ITEMS_PER_PAGE,
              }}
              dataSource={fqdnRules.map(row => ({ ...row, key: `${row.sgFrom}${row.FQDN}` }))}
              columns={columnsFqdn}
              scroll={{ x: 'max-content' }}
              size="small"
            />
          )}
        </>
      ),
    },
    {
      key: '3',
      label: <TitleWithNoTopMargin level={4}>SG-to-CIDR Rules</TitleWithNoTopMargin>,
      children: (
        <>
          {!cidrRules.length && !error && !isLoading && <Empty />}
          {cidrRules.length > 0 && (
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: true,
                showSizeChanger: false,
                defaultPageSize: ITEMS_PER_PAGE,
              }}
              dataSource={cidrRules.map(row => ({ ...row, key: `${row.SG}${row.CIDR}` }))}
              columns={columnsCidr}
              scroll={{ x: 'max-content' }}
              size="small"
            />
          )}
        </>
      ),
    },
    {
      key: '4',
      label: <TitleWithNoTopMargin level={4}>SG-to-SG-ICMP Rules</TitleWithNoTopMargin>,
      children: (
        <>
          {!sgSgIcmpRules.length && !error && !isLoading && <Empty />}
          {sgSgIcmpRules.length > 0 && (
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: true,
                showSizeChanger: false,
                defaultPageSize: ITEMS_PER_PAGE,
              }}
              dataSource={sgSgIcmpRules.map(row => ({ ...row, key: `${row.SgFrom}${row.SgTo}` }))}
              columns={columnsSgSgIcmp}
              scroll={{ x: 'max-content' }}
              size="small"
            />
          )}
        </>
      ),
    },
    {
      key: '5',
      label: <TitleWithNoTopMargin level={4}>SG-to-SG-ie Rules</TitleWithNoTopMargin>,
      children: (
        <>
          {!sgSgIeRules.length && !error && !isLoading && <Empty />}
          {sgSgIeRules.length > 0 && (
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: true,
                showSizeChanger: false,
                defaultPageSize: ITEMS_PER_PAGE,
              }}
              dataSource={sgSgIeRules.map(row => ({ ...row, key: `${row.Sg}${row.SgLocal}` }))}
              columns={columnsSgSgIe}
              scroll={{ x: 'max-content' }}
              size="small"
            />
          )}
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
        <Collapse items={items} defaultActiveKey={['1']} size="small" />
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
      <Modal
        title="Delete cidr rule"
        open={isModalOpenCidr}
        onOk={() =>
          pendingToDeleteCidrRule && removeCidrRuleFromList(pendingToDeleteCidrRule.sg, pendingToDeleteCidrRule.cidr)
        }
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenCidr(false)
          setDeleteErrorCidr(undefined)
        }}
      >
        <p>
          Are you sure you want to delete cidr rule: {pendingToDeleteCidrRule?.sg} - {pendingToDeleteCidrRule?.cidr}
        </p>
        {deleteErrorCidr && (
          <Result status="error" title={deleteErrorCidr.status} subTitle={deleteErrorCidr.data?.message} />
        )}
      </Modal>
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
