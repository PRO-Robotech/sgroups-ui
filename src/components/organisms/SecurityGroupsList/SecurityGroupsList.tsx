import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, Table, TableProps, Tag, Button, Result, Spin, Empty, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { TitleWithNoTopMargin, Spacer, CustomIcons, TextAlignContainer } from 'components'
import { getSecurityGroups, removeSecurityGroup } from 'api/securityGroups'
import { getNetworks } from 'api/networks'
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
  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const history = useHistory()

  useEffect(() => {
    setFilteredInfo({ name: id ? [id] : null })
    if (id) {
      setSearchText(id)
    }
  }, [id])

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    Promise.all([getSecurityGroups(), getNetworks()])
      .then(([sgsResponse, nwResponse]) => {
        setIsLoading(false)
        const enrichedWithCidrsSgData = sgsResponse.data.groups.map(el => ({
          ...el,
          networks: el.networks.map(nw => {
            const nwData = nwResponse.data.networks.find(entry => entry.name === nw)
            return nwData ? `${nwData.name} : ${nwData.network.CIDR}` : `${nw} : null`
          }),
        }))
        setSecurityGroups(enrichedWithCidrsSgData)
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

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { name }) => name.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Networks',
      dataIndex: 'networks',
      key: 'networks',
      render: (_, { networks }) => (
        <Styled.NetworksContainer>
          {networks.map(name => (
            <Tag key={name}>{name}</Tag>
          ))}
        </Styled.NetworksContainer>
      ),
    },
    {
      title: 'Default action',
      dataIndex: 'defaultAction',
      key: 'defaultAction',
      width: 150,
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 50,
      render: (_, { logs }) => <div>{logs ? 'true' : 'false'}</div>,
    },
    {
      title: 'Trace',
      dataIndex: 'trace',
      key: 'trace',
      width: 50,
      render: (_, { trace }) => <div>{trace ? 'true' : 'false'}</div>,
    },
    {
      title: 'Controls',
      key: 'controls',
      align: 'right',
      width: 150,
      render: (_, record: TSecurityGroup) => (
        <TextAlignContainer $align="right">
          <CustomIcons.EditIcon onClick={() => history.push(`/security-groups/edit/${record.name}`)} />{' '}
          <CustomIcons.DeleteIcon onClick={() => openRemoveSGModal(record.name)} />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Card>
        <TitleWithNoTopMargin level={2}>Security Groups</TitleWithNoTopMargin>
        <Spacer $space={15} $samespace />
        <Styled.FiltersContainer>
          {securityGroups.length > 0 && (
            <div>
              <Input
                allowClear
                placeholder="Filter by SG name"
                value={searchText}
                onChange={e => {
                  if (id) {
                    history.push('/security-groups', { replace: true })
                  }
                  setSearchText(e.target.value)
                }}
                onBlur={() => handleSearch(searchText)}
                onPressEnter={() => handleSearch(searchText)}
              />
            </div>
          )}
        </Styled.FiltersContainer>
        <Spacer $space={15} $samespace />
        {!securityGroups.length && !error && !isLoading && <Empty />}
        {securityGroups.length > 0 && (
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
            dataSource={securityGroups.map(row => ({ ...row, key: row.name }))}
            columns={columns}
            scroll={{ x: 'max-content' }}
            onChange={handleChange}
          />
        )}
        <Spacer $space={15} $samespace />
        <Button onClick={() => history.push('/security-groups/add')} type="primary">
          Add
        </Button>
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
