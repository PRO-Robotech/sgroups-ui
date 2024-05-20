/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined, CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSgSgIeIcmpRules, removeSgSgIeIcmpRule } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgSgIeIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgSgIeIcmpRuleColumn = TSgSgIeIcmpRule & {
  key: string
}

type OnChange = NonNullable<TableProps<TSgSgIeIcmpRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgSgIeIcmp: FC = () => {
  const [sgSgIeIcmpRules, setSgSgIeIcmpRules] = useState<TSgSgIeIcmpRule[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorSgSgIeIcmp, setDeleteErrorSgSgIeIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenSgSgIeIcmp, setIsModalOpenSgSgIeIcmp] = useState<boolean>(false)
  const [pendingToDeleteSgSgIeIcmpRule, setPendingToDeleteSgSgIeIcmpRule] = useState<{ sgFrom: string; sgTo: string }>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
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

  const handleSearch = (searchText: string) => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }

  const columnsSgSgIeIcmp: ColumnsType<TSgSgIeIcmpRuleColumn> = [
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
      title: 'SG',
      dataIndex: 'Sg',
      key: 'Sg',
      width: 150,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { Sg }) => Sg.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'SG Local',
      dataIndex: 'SgLocal',
      key: 'SgLocal',
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
      render: (_, { priority }) => priority?.some || DEFAULT_PRIORITIES.sgToSgIeIcmp,
    },
    {
      title: 'Types',
      dataIndex: 'ICMP',
      key: 'Types',
      width: 50,
      render: (_, { ICMP }) => ICMP.Types.join(','),
    },
    {
      title: 'Traffic',
      dataIndex: 'traffic',
      key: 'traffic',
      width: 100,
    },
    {
      title: 'Controls',
      key: 'controls',
      width: 100,
      render: (_, record: TSgSgIeIcmpRule) => (
        <TextAlignContainer $align="center">
          <CustomIcons.EditIcon onClick={() => history.push(`/rules/editor/${record.SgLocal}`)} />
          <CustomIcons.DeleteIcon onClick={() => openRemoveSgSgIeIcmpRuleModal(record.SgLocal, record.Sg)} />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: SG-SG-IE-ICMP</TitleWithNoTopMargin>
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
        <Spacer $space={15} $samespace />
        <Button type="primary" onClick={() => history.push('/rules/editor')}>
          Add
        </Button>
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
