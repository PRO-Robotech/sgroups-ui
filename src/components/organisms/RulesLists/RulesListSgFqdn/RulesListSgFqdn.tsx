/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSgFqdnRules, deleteRules } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgFqdnRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgFqdnRuleWithId = TSgFqdnRule & { id: string }

type TFqdnRuleColumn = TSgFqdnRuleWithId & {
  key: string
}

type OnChange = NonNullable<TableProps<TFqdnRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgFqdn: FC = () => {
  const [fqdnRules, setFqdnRules] = useState<TSgFqdnRuleWithId[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorFqdn, setDeleteErrorFqdn] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenFqdn, setIsModalOpenFqdn] = useState<boolean>(false)
  const [pendingToDeleteFqdnRule, setPendingToDeleteFqdnRule] = useState<TSgFqdnRuleWithId>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgFqdnRules()
      .then(({ data }) => {
        setIsLoading(false)
        setFqdnRules(data.rules.map(entry => ({ ...entry, id: nanoid() })))
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

  const removeFqdnRuleFromList = (id: string) => {
    deleteRules(
      [],
      [],
      [],
      [],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [...fqdnRules].filter(el => el.id === id).map(({ id, ...entry }) => entry),
      [],
      [],
    )
      .then(() => {
        setFqdnRules([...fqdnRules].filter(el => el.id !== id))
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

  const openRemoveFqdnRuleModal = (record: TSgFqdnRuleWithId) => {
    setPendingToDeleteFqdnRule(record)
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
          {ports?.length === 0 ? (
            <div>any : any</div>
          ) : (
            ports?.map(({ s, d }) => <div key={`${s}-${d}`}>{`${s || 'any'} : ${d || 'any'}`}</div>)
          )}
        </Styled.PortsContainer>
      ),
    },
    {
      title: 'Controls',
      key: 'controls',
      align: 'right',
      width: 100,
      render: (_, record: TSgFqdnRuleWithId) => (
        <TextAlignContainer $align="right">
          <CustomIcons.EditIcon onClick={() => history.push(`/rules-editor/${record.sgFrom}`)} />
          <CustomIcons.DeleteIcon onClick={() => openRemoveFqdnRuleModal(record)} />
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
          {fqdnRules.length > 0 && (
            <div>
              <Input
                allowClear
                placeholder="Filter by SG name"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onBlur={() => handleSearch(searchText)}
                onPressEnter={() => handleSearch(searchText)}
              />
            </div>
          )}
          <div>
            <Styled.ButtonWithMarginLeft type="primary" onClick={() => history.push('/rules-editor')}>
              Add
            </Styled.ButtonWithMarginLeft>
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
      </Card>
      <Modal
        title="Delete fqdn rule"
        open={isModalOpenFqdn}
        onOk={() => pendingToDeleteFqdnRule && removeFqdnRuleFromList(pendingToDeleteFqdnRule.id)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenFqdn(false)
          setDeleteErrorFqdn(undefined)
        }}
      >
        <p>
          Are you sure you want to delete fqdn rule: {pendingToDeleteFqdnRule?.sgFrom} - {pendingToDeleteFqdnRule?.FQDN}
        </p>
        {deleteErrorFqdn && (
          <Result status="error" title={deleteErrorFqdn.status} subTitle={deleteErrorFqdn.data?.message} />
        )}
      </Modal>
    </>
  )
}
