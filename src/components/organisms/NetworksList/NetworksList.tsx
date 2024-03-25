import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getNetworks, removeNetwork } from 'api/networks'
import { ITEMS_PER_PAGE } from 'constants/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork } from 'localTypes/networks'

export const NetworksList: FC = () => {
  const [networks, setNetworks] = useState<TNetwork[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pendingToDeleteNW, setPendingToDeleteNW] = useState<string>()
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

  type TColumn = {
    name: string
    cidr: string
    key: string
  }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
      width: 150,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record: { name: string; cidr: string }) => (
        <>
          <EditOutlined onClick={() => history.push(`/networks/edit/${record.name}`)} />{' '}
          <DeleteOutlined onClick={() => openRemoveNetworkModal(record.name)} />
        </>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Networks</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Button onClick={() => history.push('/networks/add')} type="primary">
          Add
        </Button>
        <Spacer $space={15} $samespace />
        {!networks.length && !error && !isLoading && <Empty />}
        {networks.length > 0 && (
          <Table
            pagination={{
              position: ['bottomCenter'],
              showQuickJumper: true,
              showSizeChanger: false,
              defaultPageSize: ITEMS_PER_PAGE,
              hideOnSinglePage: true,
            }}
            dataSource={networks.map(row => ({ name: row.name, cidr: row.network.CIDR, key: row.name }))}
            columns={columns}
            scroll={{ x: 'max-content' }}
          />
        )}
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
