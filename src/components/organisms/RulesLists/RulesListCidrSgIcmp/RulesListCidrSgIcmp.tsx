/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getCidrSgIcmpRules, removeCidrSgIcmpRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TCidrSgIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

type TCidrSgIcmpRuleColumn = TCidrSgIcmpRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TCidrSgIcmpRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListCidrSgIcmp: FC = () => {
  const [cidrSgIcmpRules, setCidrSgIcmpRules] = useState<TCidrSgIcmpRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorCidrSgIcmp, setDeleteErrorCidrSgIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenCidrSgIcmp, setIsModalOpenCidrSgIcmp] = useState<boolean>(false)
  const [pendingToDeleteCidrSgIcmpRule, setPendingToDeleteCidrSgIcmpRule] = useState<{ sg: string; cidr: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getCidrSgIcmpRules()
      .then(({ data }) => {
        setIsLoading(false)
        setCidrSgIcmpRules(data.rules)
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

  const removeCidrSgIcmpRuleFromList = (sg: string, cidr: string) => {
    removeCidrSgIcmpRule(sg, cidr)
      .then(() => {
        setCidrSgIcmpRules([...cidrSgIcmpRules].filter(el => el.SG !== sg || el.CIDR !== cidr))
        setIsModalOpenCidrSgIcmp(false)
        setPendingToDeleteCidrSgIcmpRule(undefined)
        setDeleteErrorCidrSgIcmp(undefined)
      })
      .catch((error: AxiosError<TRequestErrorData>) => {
        setIsLoading(false)
        if (error.response) {
          setDeleteErrorCidrSgIcmp({ status: error.response.status, data: error.response.data })
        } else if (error.status) {
          setDeleteErrorCidrSgIcmp({ status: error.status })
        } else {
          setDeleteErrorCidrSgIcmp({ status: 'Error while fetching' })
        }
      })
  }

  const openRemoveCidrSgIcmpRuleModal = (sg: string, cidr: string) => {
    setPendingToDeleteCidrSgIcmpRule({ sg, cidr })
    setIsModalOpenCidrSgIcmp(true)
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

  const columnsSgSgIeIcmp: ColumnsType<TCidrSgIcmpRuleColumn> = [
    {
      title: 'SG',
      dataIndex: 'SG',
      key: 'SG',
      width: 150,
      filteredValue: filteredInfo.name || null,
    },
    {
      title: 'CIDR',
      dataIndex: 'CIDR',
      key: 'CIDR',
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
      render: (_, record: TCidrSgIcmpRule) => (
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.SG}`)} />
          <DeleteOutlined onClick={() => openRemoveCidrSgIcmpRuleModal(record.SG, record.CIDR)} />
        </>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: CIDR-ICMP</TitleWithNoTopMargin>
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
        {!cidrSgIcmpRules.length && !error && !isLoading && <Empty />}
        {cidrSgIcmpRules.length > 0 && (
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
            dataSource={cidrSgIcmpRules.map(row => ({ ...row, key: `${row.SG}${row.CIDR}` }))}
            columns={columnsSgSgIeIcmp}
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
        title="Delete sgSgIeIcmp rule"
        open={isModalOpenCidrSgIcmp}
        onOk={() =>
          pendingToDeleteCidrSgIcmpRule &&
          removeCidrSgIcmpRuleFromList(pendingToDeleteCidrSgIcmpRule.sg, pendingToDeleteCidrSgIcmpRule.cidr)
        }
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenCidrSgIcmp(false)
          setDeleteErrorCidrSgIcmp(undefined)
        }}
      >
        <p>
          Are you sure you want to delete sgSgIeIcmp rule: {pendingToDeleteCidrSgIcmpRule?.sg} -{' '}
          {pendingToDeleteCidrSgIcmpRule?.cidr}
        </p>
        {deleteErrorCidrSgIcmp && (
          <Result status="error" title={deleteErrorCidrSgIcmp.status} subTitle={deleteErrorCidrSgIcmp.data?.message} />
        )}
      </Modal>
    </>
  )
}
