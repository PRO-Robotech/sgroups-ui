/* eslint-disable react/no-unstable-nested-components */
import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getSecurityGroups, removeSecurityGroup } from 'api/securityGroups'
import { ITEMS_PER_PAGE } from 'constants/securityGroups'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { Styled } from './styled'

type TSecurityGroupsListProps = {
  id?: string
}

type TColumn = TSecurityGroup & {
  key: string
}

type OnChange = NonNullable<TableProps<TColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const SecurityGroupsList: FC<TSecurityGroupsListProps> = ({ id }) => {
  const [securityGroups, setSecurityGroups] = useState<TSecurityGroup[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pendingToDeleteSG, setPendingToDeleteSG] = useState<string>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setFilteredInfo({ name: id ? [id] : null })
  }, [id])

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSecurityGroups()
      .then(({ data }) => {
        setIsLoading(false)
        setSecurityGroups(data.groups)
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

  const removeSgFromList = (name: string) => {
    removeSecurityGroup(name)
      .then(() => {
        setSecurityGroups([...securityGroups].filter(el => el.name !== name))
        setIsModalOpen(false)
        setPendingToDeleteSG(undefined)
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

  const openRemoveSGModal = (name: string) => {
    setPendingToDeleteSG(name)
    setIsModalOpen(true)
  }

  if (error) {
    return <Result status="error" title={error.status} subTitle={error.data?.message} />
  }
  if (isLoading) {
    return <Spin />
  }

  const handleSearch = (searchText: string[], confirm: FilterDropdownProps['confirm']) => {
    confirm()
    setSearchText(searchText[0])
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText('')
  }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      filteredValue: filteredInfo.name || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
          <Input
            placeholder="search"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys as string[], confirm)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close()
              }}
            >
              close
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, { name }) => name.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Default action',
      dataIndex: 'defaultAction',
      key: 'defaultAction',
      width: 150,
    },
    {
      title: 'Networks',
      dataIndex: 'networks',
      key: 'networks',
      width: 70,
      render: (_, { networks }) => (
        <Styled.NetworksContainer>
          {networks.map(name => (
            <div key={name}>{name}</div>
          ))}
        </Styled.NetworksContainer>
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
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record: TSecurityGroup) => (
        <>
          <EditOutlined onClick={() => history.push(`/security-groups/edit/${record.name}`)} />{' '}
          <DeleteOutlined onClick={() => openRemoveSGModal(record.name)} />
        </>
      ),
    },
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange: OnChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo(filters)
  }

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Security Groups</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Button onClick={() => history.push('/security-groups/add')} type="primary">
          Add
        </Button>
        <Spacer $space={15} $samespace />
        {!securityGroups.length && !error && !isLoading && <Empty />}
        {securityGroups.length > 0 && (
          <Table
            pagination={{
              position: ['bottomCenter'],
              showQuickJumper: true,
              showSizeChanger: false,
              defaultPageSize: ITEMS_PER_PAGE,
              hideOnSinglePage: true,
            }}
            dataSource={securityGroups.map(row => ({ ...row, key: row.name }))}
            columns={columns}
            scroll={{ x: 'max-content' }}
            onChange={handleChange}
          />
        )}
      </Card>
      <Modal
        title="Delete security group"
        open={isModalOpen}
        onOk={() => pendingToDeleteSG && removeSgFromList(pendingToDeleteSG)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpen(false)
          setDeleteError(undefined)
        }}
      >
        <p>Are you sure you want to delete {pendingToDeleteSG}</p>
        {deleteError && <Result status="error" title={deleteError.status} subTitle={deleteError.data?.message} />}
      </Modal>
    </>
  )
}
