import React, { FC, useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { Button, Table, TableProps, PaginationProps, Result, Spin, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, TrashSimple, MagnifyingGlass, PencilSimpleLine, X } from '@phosphor-icons/react'
import {
  TitleWithNoMargins,
  CustomEmpty,
  TextAlignContainer,
  MiddleContainer,
  TinyButton,
  NetworkAddModal,
  NetworkEditModal,
  NetworkDeleteModal,
  TableComponents,
  Layouts,
  FlexButton,
} from 'components'
import { getSecurityGroups } from 'api/securityGroups'
import { getNetworks } from 'api/networks'
import { ITEMS_PER_PAGE } from 'constants/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetwork, TNetworkForm } from 'localTypes/networks'
import { Styled } from './styled'

type TNetworkEnriched = TNetwork & {
  securityGroup?: string
}

type TNetworkFormEnriched = TNetworkForm & {
  securityGroup?: string
}

type TColumn = TNetworkFormEnriched & {
  key: string
}

type OnChange = NonNullable<TableProps<TColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const NetworksList: FC = () => {
  const [api, contextHolder] = notification.useNotification()

  const [networks, setNetworks] = useState<TNetworkEnriched[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<TNetworkFormEnriched[] | boolean>(false)
  const [isModalAddOpen, setIsModalAddOpen] = useState(false)
  const [isModalEditOpen, setIsModalEditOpen] = useState<TNetworkFormEnriched | boolean>(false)

  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRowsData, setSelectedRowsData] = useState<TNetworkFormEnriched[]>([])

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)

    Promise.all([getSecurityGroups(), getNetworks()])
      .then(([sgsResponse, nwResponse]) => {
        setIsLoading(false)
        const enrichedWithSgNetworks = nwResponse.data.networks.map(el => ({
          ...el,
          securityGroup: sgsResponse.data.groups.find(({ networks }) => networks.includes(el.name))?.name,
        }))
        setNetworks(enrichedWithSgNetworks)
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
      width: '33%',
    },
    {
      title: 'CIDR',
      dataIndex: 'CIDR',
      key: 'CIDR',
      width: '33%',
    },
    {
      title: 'SecurityGroup',
      dataIndex: 'securityGroup',
      key: 'securityGroup',
      width: 'auto',
    },
    {
      title: '',
      key: 'controls',
      align: 'right',
      className: 'controls',
      width: 84,
      render: (_, record: TNetworkFormEnriched) => (
        <TextAlignContainer $align="right" className="hideable">
          <TinyButton
            type="text"
            size="small"
            onClick={() => setIsModalEditOpen(record)}
            icon={<PencilSimpleLine size={14} />}
          />
          <TinyButton
            type="text"
            size="small"
            onClick={() => setIsModalDeleteOpen([record])}
            icon={<TrashSimple size={14} />}
          />
        </TextAlignContainer>
      ),
    },
  ]

  const showTotal: PaginationProps['showTotal'] = total => `Total: ${total}`

  const clearSelected = () => {
    setSelectedRowKeys([])
    setSelectedRowsData([])
  }

  return (
    <>
      <Layouts.HeaderRow>
        <TitleWithNoMargins level={3}>Networks</TitleWithNoMargins>
      </Layouts.HeaderRow>
      <Layouts.ControlsRow>
        <Layouts.ControlsRightSide>
          {selectedRowsData.length > 0 ? (
            <>
              <Styled.SelectedItemsText>Selected Items: {selectedRowsData.length}</Styled.SelectedItemsText>
              <Button type="text" icon={<X size={16} color="#00000073" />} onClick={clearSelected} />
            </>
          ) : (
            <FlexButton onClick={() => setIsModalAddOpen(true)} type="primary" icon={<Plus size={20} />}>
              Add
            </FlexButton>
          )}
          <Layouts.Separator />
          <Button
            disabled={selectedRowsData.length === 0}
            type="text"
            icon={<TrashSimple size={18} />}
            onClick={() => setIsModalDeleteOpen(selectedRowsData)}
          />
        </Layouts.ControlsRightSide>
        <Layouts.ControlsLeftSide>
          <Layouts.SearchControl>
            <Layouts.InputWithCustomPreffixMargin
              allowClear
              placeholder="Search"
              prefix={<MagnifyingGlass color="#00000073" />}
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value)
              }}
            />
          </Layouts.SearchControl>
        </Layouts.ControlsLeftSide>
      </Layouts.ControlsRow>
      {isLoading && (
        <MiddleContainer>
          <Spin />
        </MiddleContainer>
      )}
      {!networks.length && !error && !isLoading && <CustomEmpty />}
      {networks.length > 0 && (
        <TableComponents.TableContainer>
          <TableComponents.HideableControls>
            <Table
              pagination={{
                position: ['bottomLeft'],
                showSizeChanger: true,
                defaultPageSize: ITEMS_PER_PAGE,
                hideOnSinglePage: false,
                showTotal,
              }}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (selectedRowKeys: React.Key[], selectedRows: TColumn[]) => {
                  setSelectedRowKeys(selectedRowKeys)
                  setSelectedRowsData(selectedRows)
                },
              }}
              dataSource={networks.map(row => ({
                name: row.name,
                CIDR: row.network.CIDR,
                securityGroup: row.securityGroup,
                key: row.name,
              }))}
              columns={columns}
              scroll={{ x: 'max-content' }}
              onChange={handleChange}
            />
          </TableComponents.HideableControls>
        </TableComponents.TableContainer>
      )}
      <NetworkAddModal
        externalOpenInfo={isModalAddOpen}
        setExternalOpenInfo={setIsModalAddOpen}
        openNotification={openNotification}
        initNetworks={networks}
        setInitNetworks={setNetworks}
      />
      <NetworkEditModal
        externalOpenInfo={isModalEditOpen}
        setExternalOpenInfo={setIsModalEditOpen}
        openNotification={openNotification}
        initNetworks={networks}
        setInitNetworks={setNetworks}
      />
      <NetworkDeleteModal
        externalOpenInfo={isModalDeleteOpen}
        setExternalOpenInfo={setIsModalDeleteOpen}
        openNotification={openNotification}
        initNetworks={networks}
        setInitNetworks={setNetworks}
      />
      {contextHolder}
    </>
  )
}
