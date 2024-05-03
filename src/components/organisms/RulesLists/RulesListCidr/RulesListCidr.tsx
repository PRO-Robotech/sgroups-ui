/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getCidrSgRules, removeCidrSgRule } from 'api/rules'
import { ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TCidrRule } from 'localTypes/rules'
import { Styled } from './styled'

type TCidrRuleColumn = TCidrRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TCidrRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListCidr: FC = () => {
  const [cidrRules, setCidrRules] = useState<TCidrRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorCidr, setDeleteErrorCidr] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenCidr, setIsModalOpenCidr] = useState<boolean>(false)
  const [pendingToDeleteCidrRule, setPendingToDeleteCidrRule] = useState<{ sg: string; cidr: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getCidrSgRules()
      .then(({ data }) => {
        setIsLoading(false)
        setCidrRules(data.rules)
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

  const openRemoveCidrRuleModal = (sg: string, cidr: string) => {
    setPendingToDeleteCidrRule({ sg, cidr })
    setIsModalOpenCidr(true)
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

  const columnsCidr: ColumnsType<TCidrRuleColumn> = [
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
        <>
          <EditOutlined onClick={() => history.push(`/rules/editor/${record.SG}`)} />
          <DeleteOutlined onClick={() => openRemoveCidrRuleModal(record.SG, record.CIDR)} />
        </>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: SG-CIDR</TitleWithNoTopMargin>
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
        {!cidrRules.length && !error && !isLoading && <Empty />}
        {cidrRules.length > 0 && (
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
            dataSource={cidrRules.map(row => ({ ...row, key: `${row.SG}${row.CIDR}` }))}
            columns={columnsCidr}
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
    </>
  )
}
