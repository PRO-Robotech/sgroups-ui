import React, { FC, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Button, Table, TableProps, Result, Spin, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { TrashSimple, MagnifyingGlass, PencilSimpleLine } from '@phosphor-icons/react'
import { TitleWithNoMargins, CustomEmpty, TextAlignContainer, MiddleContainer, TinyButton } from 'components'
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

  useEffect(() => {
    setFilteredInfo({ name: searchText ? [searchText] : null })
  }, [searchText])

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
    return (
      <MiddleContainer>
        <Result status="error" title={error.status} subTitle={error.data?.message} />
      </MiddleContainer>
    )
  }

  const columns: ColumnsType<TColumn> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: filteredInfo.name || null,
      onFilter: (value, { name }) => name.toLowerCase().includes((value as string).toLowerCase()),
      width: '50%',
    },
    {
      title: 'CIDR',
      dataIndex: 'cidr',
      key: 'cidr',
      width: 'auto',
    },
    {
      title: '',
      key: 'controls',
      align: 'right',
      width: 100,
      render: (_, record: { name: string; cidr: string }) => (
        <TextAlignContainer $align="right" className="hideable">
          <TinyButton
            type="text"
            size="small"
            onClick={() => history.push(`/networks/edit/${record.name}`)}
            icon={<PencilSimpleLine size={16} />}
          />
          <TinyButton
            type="text"
            size="small"
            onClick={() => openRemoveNetworkModal(record.name)}
            icon={<TrashSimple size={16} />}
          />
        </TextAlignContainer>
      ),
    },
  ]

  return (
    <>
      <Styled.HeaderRow>
        <TitleWithNoMargins level={3}>Networks</TitleWithNoMargins>
      </Styled.HeaderRow>
      <Styled.ControlsRow>
        <Styled.ControlsRightSide>
          <Button onClick={() => history.push('/networks/add')} type="primary">
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
      {!networks.length && !error && !isLoading && <CustomEmpty />}
      {networks.length > 0 && (
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
              dataSource={networks.map(row => ({ name: row.name, cidr: row.network.CIDR, key: row.name }))}
              columns={columns}
              scroll={{ x: 'max-content' }}
              onChange={handleChange}
            />
          </Styled.HideableControls>
        </Styled.TableContainer>
      )}
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
