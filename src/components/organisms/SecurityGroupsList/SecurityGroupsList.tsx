import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, Button, Result, Spin, Empty, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin, Spacer } from 'components'
import { getSecurityGroups, removeSecurityGroup } from 'api/securityGroups'
import { ITEMS_PER_PAGE } from 'constants/securityGroups'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { Styled } from './styled'

export const SecurityGroupsList: FC = () => {
  const [securityGroups, setSecurityGroups] = useState<TSecurityGroup[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [deleteError, setDeleteError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pendingToDeleteSG, setPendingToDeleteSG] = useState<string>()
  const history = useHistory()

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

  type TColumn = TSecurityGroup & {
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

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Security Groups</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Button onClick={() => history.push('/security-groups/add')}>Add</Button>
        <Spacer $space={15} $samespace />
        {!securityGroups.length && !error && !isLoading && <Empty />}
        <Table
          pagination={{
            position: ['bottomCenter'],
            showQuickJumper: true,
            showSizeChanger: false,
            defaultPageSize: ITEMS_PER_PAGE,
          }}
          dataSource={securityGroups.map(row => ({ ...row, key: row.name }))}
          columns={columns}
          scroll={{ x: 'max-content' }}
        />
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
