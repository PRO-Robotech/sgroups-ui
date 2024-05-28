/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSgCidrIcmpRules, deleteRules } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgCidrIcmpRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgCidrIcmpRuleWithId = TSgCidrIcmpRule & { id: string }

type TCidrSgIcmpRuleColumn = TSgCidrIcmpRuleWithId & {
  key: string
}

type OnChange = NonNullable<TableProps<TCidrSgIcmpRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgCidrIcmp: FC = () => {
  const [cidrSgIcmpRules, setCidrSgIcmpRules] = useState<TSgCidrIcmpRuleWithId[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorCidrSgIcmp, setDeleteErrorCidrSgIcmp] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenCidrSgIcmp, setIsModalOpenCidrSgIcmp] = useState<boolean>(false)
  const [pendingToDeleteCidrSgIcmpRule, setPendingToDeleteCidrSgIcmpRule] = useState<TSgCidrIcmpRuleWithId>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgCidrIcmpRules()
      .then(({ data }) => {
        setIsLoading(false)
        setCidrSgIcmpRules(data.rules.map(entry => ({ ...entry, id: nanoid() })))
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

  const removeCidrSgIcmpRuleFromList = (id: string) => {
    deleteRules(
      [],
      [],
      [],
      [],
      [],
      [],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [...cidrSgIcmpRules].filter(el => el.id === id).map(({ id, ...entry }) => entry),
    )
      .then(() => {
        setCidrSgIcmpRules([...cidrSgIcmpRules].filter(el => el.id !== id))
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

  const openRemoveCidrSgIcmpRuleModal = (record: TSgCidrIcmpRuleWithId) => {
    setPendingToDeleteCidrSgIcmpRule(record)
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
      dataIndex: 'SG',
      key: 'SG',
      width: 150,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { SG }) => SG.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'CIDR',
      dataIndex: 'CIDR',
      key: 'CIDR',
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
      render: (_, { priority }) => priority?.some || DEFAULT_PRIORITIES.sgToCidrIeIcmp,
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
      render: (_, record: TSgCidrIcmpRuleWithId) => (
        <TextAlignContainer $align="center">
          <CustomIcons.EditIcon onClick={() => history.push(`/rules-editor/${record.SG}`)} />
          <CustomIcons.DeleteIcon onClick={() => openRemoveCidrSgIcmpRuleModal(record)} />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Rules: CIDR-ICMP</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Styled.FiltersContainer>
          {cidrSgIcmpRules.length > 0 && (
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
        <Button type="primary" onClick={() => history.push('/rules-editor')}>
          Add
        </Button>
      </Card>
      <Modal
        title="Delete sgSgIeIcmp rule"
        open={isModalOpenCidrSgIcmp}
        onOk={() => pendingToDeleteCidrSgIcmpRule && removeCidrSgIcmpRuleFromList(pendingToDeleteCidrSgIcmpRule.id)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenCidrSgIcmp(false)
          setDeleteErrorCidrSgIcmp(undefined)
        }}
      >
        <p>
          Are you sure you want to delete sgSgIeIcmp rule: {pendingToDeleteCidrSgIcmpRule?.SG} -{' '}
          {pendingToDeleteCidrSgIcmpRule?.CIDR}
        </p>
        {deleteErrorCidrSgIcmp && (
          <Result status="error" title={deleteErrorCidrSgIcmp.status} subTitle={deleteErrorCidrSgIcmp.data?.message} />
        )}
      </Modal>
    </>
  )
}
