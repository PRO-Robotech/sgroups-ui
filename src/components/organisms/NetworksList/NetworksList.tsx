/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import React, { FC, useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { Button, Table, TableProps, PaginationProps, Result, Spin, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined } from '@ant-design/icons'
import { Plus, TrashSimple, MagnifyingGlass, PencilSimpleLine, X } from '@phosphor-icons/react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import ipRangeCheck from 'ip-range-check'
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
  FilterDropdown,
} from 'components'
import { getSecurityGroups } from 'api/securityGroups'
import { getNetworks } from 'api/networks'
import { ITEMS_PER_PAGE } from 'constants/networks'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TNetworkWithSg, TNetworkFormWithSg } from 'localTypes/networks'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { Styled } from './styled'

type TColumn = TNetworkFormWithSg & {
  key: string
}

type OnChange = NonNullable<TableProps<TColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const NetworksList: FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme)
  const [api, contextHolder] = notification.useNotification()

  const [networks, setNetworks] = useState<TNetworkWithSg[]>([])
  const [securityGroups, setSecurityGroups] = useState<TSecurityGroup[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<TNetworkFormWithSg[] | boolean>(false)
  const [isModalAddOpen, setIsModalAddOpen] = useState(false)
  const [isModalEditOpen, setIsModalEditOpen] = useState<TNetworkFormWithSg | boolean>(false)

  const [searchText, setSearchText] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cidrSearchText, setCidrSearchText] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sgSearchText, setSgSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRowsData, setSelectedRowsData] = useState<TNetworkFormWithSg[]>([])

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)

    Promise.all([getSecurityGroups(), getNetworks()])
      .then(([sgsResponse, nwResponse]) => {
        setIsLoading(false)
        setSecurityGroups(sgsResponse.data.groups)
        const enrichedWithSgNetworks = nwResponse.data.networks.map(el => ({
          ...el,
          securityGroup: sgsResponse.data.groups.find(({ networks }) => networks.includes(el.name))?.name,
        }))
        setNetworks(enrichedWithSgNetworks.sort((a, b) => a.name.localeCompare(b.name)))
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChange: OnChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo({ ...filters, name: searchText ? [searchText] : null })
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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'CIDR',
      dataIndex: 'CIDR',
      key: 'CIDR',
      width: '33%',
      filteredValue: filteredInfo.CIDR || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <FilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
          close={close}
          setSearchText={setCidrSearchText}
        />
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, { CIDR }) =>
        ipRangeCheck(value as string, CIDR) || CIDR.toLowerCase().includes((value as string).toLowerCase()),
      sorter: (a, b) => a.CIDR.localeCompare(b.CIDR),
    },
    {
      title: 'SecurityGroup',
      dataIndex: 'securityGroup',
      key: 'securityGroup',
      width: 'auto',
      filteredValue: filteredInfo.securityGroup || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <FilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
          close={close}
          setSearchText={setSgSearchText}
        />
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, { securityGroup }) =>
        securityGroup ? securityGroup?.toLowerCase().includes((value as string).toLowerCase()) : false,
      sorter: (a, b) => {
        if (a.securityGroup && b.securityGroup) {
          return a.securityGroup.localeCompare(b.securityGroup)
        }
        return a.securityGroup ? 1 : -1
      },
    },
    {
      title: '',
      key: 'controls',
      align: 'right',
      className: 'controls',
      width: 84,
      render: (_, record: TNetworkFormWithSg) => (
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
      <Layouts.HeaderRow $isDark={theme === 'dark'}>
        <TitleWithNoMargins level={3}>Networks</TitleWithNoMargins>
      </Layouts.HeaderRow>
      <Layouts.ControlsRow $isDark={theme === 'dark'}>
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
          <Layouts.Separator $isDark={theme === 'dark'} />
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
                setFilteredInfo({ ...filteredInfo, name: e.target.value ? [e.target.value] : null })
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
        options={securityGroups}
        setOptions={setSecurityGroups}
      />
      <NetworkEditModal
        externalOpenInfo={isModalEditOpen}
        setExternalOpenInfo={setIsModalEditOpen}
        openNotification={openNotification}
        initNetworks={networks}
        setInitNetworks={setNetworks}
        options={securityGroups}
        setOptions={setSecurityGroups}
      />
      <NetworkDeleteModal
        externalOpenInfo={isModalDeleteOpen}
        setExternalOpenInfo={setIsModalDeleteOpen}
        openNotification={openNotification}
        initNetworks={networks}
        setInitNetworks={setNetworks}
        clearSelected={clearSelected}
        securityGroups={securityGroups}
        setSecurityGroups={setSecurityGroups}
      />
      {contextHolder}
    </>
  )
}
