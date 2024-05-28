/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined, CheckOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSgCidrRules, deleteRules } from 'api/rules'
import { DEFAULT_PRIORITIES, ITEMS_PER_PAGE } from 'constants/rules'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSgCidrRule } from 'localTypes/rules'
import { Styled } from './styled'

type TSgCidrRuleWithId = TSgCidrRule & { id: string }

type TCidrRuleColumn = TSgCidrRuleWithId & {
  key: string
}

type OnChange = NonNullable<TableProps<TCidrRuleColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const RulesListSgCidr: FC = () => {
  const [cidrRules, setCidrRules] = useState<TSgCidrRuleWithId[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteErrorCidr, setDeleteErrorCidr] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpenCidr, setIsModalOpenCidr] = useState<boolean>(false)
  const [pendingToDeleteCidrRule, setPendingToDeleteCidrRule] = useState<TSgCidrRuleWithId>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSgCidrRules()
      .then(({ data }) => {
        setIsLoading(false)
        setCidrRules(data.rules.map(entry => ({ ...entry, id: nanoid() })))
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

  const removeCidrRuleFromList = (id: string) => {
    deleteRules(
      [],
      [],
      [],
      [],
      [],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [...cidrRules].filter(el => el.id === id).map(({ id, ...entry }) => entry),
      [],
    )
      .then(() => {
        setCidrRules([...cidrRules].filter(el => el.id !== id))
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

  const openRemoveCidrRuleModal = (record: TSgCidrRuleWithId) => {
    setPendingToDeleteCidrRule(record)
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
      render: (_, { priority }) => priority?.some || DEFAULT_PRIORITIES.sgToCidrIe,
    },
    {
      title: 'Ports',
      dataIndex: 'ports',
      key: 'ports',
      width: 50,
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
      title: 'Traffic',
      dataIndex: 'traffic',
      key: 'traffic',
      width: 100,
    },
    {
      title: 'Controls',
      key: 'controls',
      width: 100,
      render: (_, record: TSgCidrRuleWithId) => (
        <TextAlignContainer $align="center">
          <CustomIcons.EditIcon onClick={() => history.push(`/rules-editor/${record.SG}`)} />
          <CustomIcons.DeleteIcon onClick={() => openRemoveCidrRuleModal(record)} />
        </TextAlignContainer>
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
        <Button type="primary" onClick={() => history.push('/rules-editor')}>
          Add
        </Button>
      </Card>
      <Modal
        title="Delete cidr rule"
        open={isModalOpenCidr}
        onOk={() => pendingToDeleteCidrRule && removeCidrRuleFromList(pendingToDeleteCidrRule.id)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpenCidr(false)
          setDeleteErrorCidr(undefined)
        }}
      >
        <p>
          Are you sure you want to delete cidr rule: {pendingToDeleteCidrRule?.SG} - {pendingToDeleteCidrRule?.CIDR}
        </p>
        {deleteErrorCidr && (
          <Result status="error" title={deleteErrorCidr.status} subTitle={deleteErrorCidr.data?.message} />
        )}
      </Modal>
    </>
  )
}
