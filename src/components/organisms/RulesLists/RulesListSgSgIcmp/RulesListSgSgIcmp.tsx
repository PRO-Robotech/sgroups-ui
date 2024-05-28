/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSgSgIcmpRules, deleteRules } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgSgIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgSgIcmpRuleWithId = TSgSgIcmpRule & { id: string }

type TSgSgIcmpRuleColumn = TSgSgIcmpRuleWithId & {
  key: string
}

type OnChange = NonNullable<TableProps<TSgSgIcmpRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgSgIcmp: FC = () => {
  const [sgSgIcmpRules, setSgSgIcmpRules] = useState<TSgSgIcmpRuleWithId[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIcmp, setDeleteErrorSgSgIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenSgSgIcmp, setIsModalOpenSgSgIcmp] = useState<boolean>(false)
  const [pendingToDeleteSgSgIcmpRule, setPendingToDeleteSgSgIcmpRule] = useState<TSgSgIcmpRuleWithId>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgSgIcmpRules()
      .then(({ data }) => {
        setIsLoading(false)
        setSgSgIcmpRules(data.rules.map(entry => ({ ...entry, id: nanoid() })))
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

  const removeSgSgIcmpRuleFromList = (id: string) => {
    deleteRules(
      [],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [...sgSgIcmpRules].filter(el => el.id === id).map(({ id, ...entry }) => entry),
      [],
      [],
      [],
      [],
      [],
    )
      .then(() => {
        setSgSgIcmpRules([...sgSgIcmpRules].filter(el => el.id !== id))
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

  const openRemoveSgSgIcmpRuleModal = (record: TSgSgIcmpRuleWithId) => {
    setPendingToDeleteSgSgIcmpRule(record)
    setIsModalOpenSgSgIcmp(true)
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

  const columnsSgSgIcmp: ColumnsType<TSgSgIcmpRuleColumn> = [
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
      title: 'ICMP',
      dataIndex: 'ICMP',
      key: 'ICMP',
      width: 50,
      render: (_, { ICMP }) => ICMP.IPv,
    },
    {
      title: 'SG From',
      dataIndex: 'SgFrom',
      key: 'SgFrom',
      width: 150,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { SgFrom }) => SgFrom.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'SG To',
      dataIndex: 'SgTo',
      key: 'SgTo',
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
      title: 'Trace',
      dataIndex: 'trace',
      key: 'trace',
      width: 50,
      render: (_, { trace }) => {
        return trace ? <CheckOutlined style={{ color: 'green' }} /> : <CloseOutlined style={{ color: 'red' }} />
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 50,
      render: (_, { priority }) => priority?.some || DEFAULT_PRIORITIES.sgToSgIcmp,
    },
    {
      title: 'Types',
      dataIndex: 'ICMP',
      key: 'Types',
      width: 100,
      render: (_, { ICMP }) => ICMP.Types.join(','),
    },
    {
      title: 'Controls',
      key: 'controls',
      align: 'right',
      width: 100,
      render: (_, record: TSgSgIcmpRuleWithId) => (
        <TextAlignContainer $align="right">
          <CustomIcons.EditIcon onClick={() => history.push(`/rules-editor/${record.SgFrom}`)} />
          <CustomIcons.DeleteIcon onClick={() => openRemoveSgSgIcmpRuleModal(record)} />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: SG-SG-ICMP</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Styled.FiltersContainer>
          {sgSgIcmpRules.length > 0 && (
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
        onOk={() => pendingToDeleteSgSgIcmpRule && removeSgSgIcmpRuleFromList(pendingToDeleteSgSgIcmpRule.id)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenSgSgIcmp(false)
          setDeleteErrorSgSgIcmp(undefined)
        }}
      >
        <p>
          Are you sure you want to delete sgSgIcmp rule: {pendingToDeleteSgSgIcmpRule?.SgFrom} -{' '}
          {pendingToDeleteSgSgIcmpRule?.SgTo}
        </p>
        {deleteErrorSgSgIcmp && (
          <Result status="error" title={deleteErrorSgSgIcmp.status} subTitle={deleteErrorSgSgIcmp.data?.message} />
        )}
      </Modal>
    </>
  )
}
