import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Button, Table, TableProps, Tag, Result, Spin, notification } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { TrashSimple, MagnifyingGlass, PencilSimpleLine } from '@phosphor-icons/react'
import type { ColumnsType } from 'antd/es/table'
import {
  TitleWithNoMargins,
  CustomEmpty,
  TextAlignContainer,
  MiddleContainer,
  TinyButton,
  SecurityGroupAddModal,
  SecurityGroupEditModal,
  SecurityGroupDeleteModal,
} from 'components'
import { getSecurityGroups } from 'api/securityGroups'
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
  const [api, contextHolder] = notification.useNotification()

  const [securityGroups, setSecurityGroups] = useState<TSecurityGroup[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<string | boolean>(false)
  const [isModalAddOpen, setIsModalAddOpen] = useState<boolean>(false)
  const [isModalEditOpen, setIsModalEditOpen] = useState<string | boolean>(false)

  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})

  const history = useHistory()

  useEffect(() => {
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

  useEffect(() => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }, [searchText])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange: OnChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo(filters)
  }

  const openNotification = (msg: string) => {
    api.success({
      message: msg,
      placement: 'topRight',
    })
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
        <TextAlignContainer $align="right" className="hideable">
          <TinyButton
            type="text"
            size="small"
            onClick={() => setIsModalEditOpen(record.name)}
            icon={<PencilSimpleLine size={16} />}
          />
          <TinyButton
            type="text"
            size="small"
            onClick={() => setIsModalDeleteOpen(record.name)}
            icon={<TrashSimple size={16} />}
          />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Styled.HeaderRow>
        <TitleWithNoMargins level={3}>Security Groups</TitleWithNoMargins>
      </Styled.HeaderRow>
      <Styled.ControlsRow>
        <Styled.ControlsRightSide>
          <Button onClick={() => setIsModalAddOpen(true)} type="primary">
            <PlusOutlined /> Add
          </Button>
          <Styled.Separator />
          <Button type="text" icon={<TrashSimple color="#00000040" size={18} />} />
        </Styled.ControlsRightSide>
        <Styled.ControlsLeftSide>
          <Styled.SearchControl>
            <Styled.InputWithCustomPreffixMargin
              allowClear
              placeholder="Search"
              prefix={<MagnifyingGlass />}
              value={searchText}
              onChange={e => {
                if (id) {
                  history.push('/security-groups', { replace: true })
                }
                setSearchText(e.target.value)
              }}
            />
          </Styled.SearchControl>
        </Styled.ControlsLeftSide>
      </Styled.ControlsRow>
      {isLoading && (
        <MiddleContainer>
          <Spin />
        </MiddleContainer>
      )}
      {!securityGroups.length && !error && !isLoading && <CustomEmpty />}
      {securityGroups.length > 0 && (
        <Styled.TableContainer>
          <Styled.HideableControls>
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: {
                  goButton: <Button size="small">Go</Button>,
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
          </Styled.HideableControls>
        </Styled.TableContainer>
      )}
      <SecurityGroupDeleteModal
        externalOpenInfo={isModalDeleteOpen}
        setExternalOpenInfo={setIsModalDeleteOpen}
        openNotification={openNotification}
        securityGroups={securityGroups}
        setSecurityGroups={setSecurityGroups}
      />
      <SecurityGroupAddModal
        externalOpenInfo={isModalAddOpen}
        setExternalOpenInfo={setIsModalAddOpen}
        openNotification={openNotification}
      />
      <SecurityGroupEditModal
        externalOpenInfo={isModalEditOpen}
        setExternalOpenInfo={setIsModalEditOpen}
        openNotification={openNotification}
      />
      {contextHolder}
    </>
  )
}
