import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getNetworks, removeNetwork } from 'api/networks'
import { ITEMS_PER_PAGE } from 'constants/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork } from 'localTypes/networks'
import { Styled } from './styled'

type TColumn = {
  name: string
  cidr: string
  key: string
}

type OnChange = NonNullable<TableProps<TColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const NetworksList: FC = () => {
  const [networks, setNetworks] = useState<TNetwork[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pendingToDeleteNW, setPendingToDeleteNW] = useState<string>()
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getNetworks()
      .then(({ data }) => {
        setIsLoading(false)
        setNetworks(data.networks)
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

  const handleSearch = (searchText: string) => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange: OnChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo(filters)
  }

  const removeNetworkFromList = (name: string) => {
    removeNetwork(name)
      .then(() => {
        setNetworks([...networks].filter(el => el.name !== name))
        setIsModalOpen(false)
        setPendingToDeleteNW(undefined)
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

  const openRemoveNetworkModal = (name: string) => {
    setPendingToDeleteNW(name)
    setIsModalOpen(true)
  }

  if (error) {
    return <Result status="error" title={error.status} subTitle={error.data?.message} />
  }

  if (isLoading) {
    return <Spin />
  }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { name }) => name.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
    },
    {
      title: 'Controls',
      key: 'controls',
      align: 'right',
      width: 100,
      render: (_, record: { name: string; cidr: string }) => (
        <TextAlignContainer $align="right">
          <CustomIcons.EditIcon onClick={() => history.push(`/networks/edit/${record.name}`)} />{' '}
          <CustomIcons.DeleteIcon onClick={() => openRemoveNetworkModal(record.name)} />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Networks</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Styled.FiltersContainer>
          {networks.length > 0 && (
            <div>
              <Input
                allowClear
                placeholder="Filter by NW name"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onBlur={() => handleSearch(searchText)}
                onPressEnter={() => handleSearch(searchText)}
              />
            </div>
          )}
        </Styled.FiltersContainer>
        <Spacer $space={15} $samespace />
        {!networks.length && !error && !isLoading && <Empty />}
        {networks.length > 0 && (
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
            dataSource={networks.map(row => ({ name: row.name, cidr: row.network.CIDR, key: row.name }))}
            columns={columns}
            scroll={{ x: 'max-content' }}
            onChange={handleChange}
          />
        )}
        <Spacer $space={15} $samespace />
        <Button onClick={() => history.push('/networks/add')} type="primary">
          Add
        </Button>
      </Card>
      <Modal
        title="Delete network"
        open={isModalOpen}
        onOk={() => pendingToDeleteNW && removeNetworkFromList(pendingToDeleteNW)}
        confirmLoading={isLoading}
        onCancel={() => {
          setIsModalOpen(false)
          setDeleteError(undefined)
        }}
      >
        <p>Are you sure you want to delete {pendingToDeleteNW}</p>
        {deleteError && <Result status="error" title={deleteError.status} subTitle={deleteError.data?.message} />}
      </Modal>
    </>
  )
}
