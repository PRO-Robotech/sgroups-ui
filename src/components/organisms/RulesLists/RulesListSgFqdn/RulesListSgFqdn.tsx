/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined, CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSgFqdnRules, removeSgFqdnRule } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgFqdnRule } from 'localTypes/rules'
import { Styled } from './styled'

type TFqdnRuleColumn = TSgFqdnRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TFqdnRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgFqdn: FC = () => {
  const [fqdnRules, setFqdnRules] = useState<TSgFqdnRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorFqdn, setDeleteErrorFqdn] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenFqdn, setIsModalOpenFqdn] = useState<boolean>(false)
  const [pendingToDeleteFqdnRule, setPendingToDeleteFqdnRule] = useState<{ sgFrom: string; fqdn: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgFqdnRules()
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
    removeSgFqdnRule(sg, fqdn)
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

  const handleSearch = (searchText: string) => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }

  const columnsFqdn: ColumnsType<TFqdnRuleColumn> = [
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
      title: 'FQDN',
      dataIndex: 'FQDN',
      key: 'FQDN',
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
      render: (_, { priority }) => priority?.some || DEFAULT_PRIORITIES.sgToFqdn,
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
      width: 100,
      render: (_, record: TSgFqdnRule) => (
        <TextAlignContainer $align="center">
          <CustomIcons.EditIcon onClick={() => history.push(`/rules/editor/${record.sgFrom}`)} />
          <CustomIcons.DeleteIcon onClick={() => openRemoveFqdnRuleModal(record.sgFrom, record.FQDN)} />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: SG-FQDN</TitleWithNoTopMargin>
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
        <Spacer $space={15} $samespace />
        <Button type="primary" onClick={() => history.push('/rules/editor')}>
          Add
        </Button>
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
