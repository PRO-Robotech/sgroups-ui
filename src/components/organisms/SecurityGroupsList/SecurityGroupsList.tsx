/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { Button, Table, TableProps, PaginationProps, Result, Spin, notification, Tag, Switch, Popover } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, TrashSimple, MagnifyingGlass, PencilSimpleLine, X } from '@phosphor-icons/react'
import {
  TitleWithNoMargins,
  CustomEmpty,
  TextAlignContainer,
  MiddleContainer,
  TinyButton,
  SecurityGroupAddModal,
  SecurityGroupEditModal,
  SecurityGroupDeleteModal,
  TableComponents,
  Layouts,
  FlexButton,
} from 'components'
import { getSecurityGroups } from 'api/securityGroups'
import { getNetworks } from 'api/networks'
import { ITEMS_PER_PAGE } from 'constants/securityGroups'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { TNetwork } from 'localTypes/networks'
import { Styled } from './styled'

type TColumn = TSecurityGroup & {
  key: string
}

type OnChange = NonNullable<TableProps<TColumn>['onChange']>

type Filters = Parameters<OnChange>[1]

export const SecurityGroupsList: FC = () => {
  const [api, contextHolder] = notification.useNotification()

  const [securityGroups, setSecurityGroups] = useState<TSecurityGroup[]>([])
  const [nwResponse, setNwResponse] = useState<TNetwork[]>([])
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<TSecurityGroup[] | boolean>(false)
  const [isModalAddOpen, setIsModalAddOpen] = useState<boolean>(false)
  const [isModalEditOpen, setIsModalEditOpen] = useState<TSecurityGroup | boolean>(false)

  const [searchText, setSearchText] = useState('')
  const [filteredInfo, setFilteredInfo] = useState<Filters>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRowsData, setSelectedRowsData] = useState<TSecurityGroup[]>([])

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    Promise.all([getSecurityGroups(), getNetworks()])
      .then(([sgsResponse, nwResponse]) => {
        setIsLoading(false)
        setNwResponse(nwResponse.data.networks)
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
      width: 350,
    },
    {
      title: 'Networks',
      dataIndex: 'networks',
      key: 'networks',
      render: (_, { networks }) => (
        <Styled.UncontrolledSelect
          mode="multiple"
          maxTagCount="responsive"
          defaultValue={networks.map(el => ({ label: el, value: el }))}
          options={networks.map(el => ({ label: el, value: el }))}
          dropdownStyle={{ display: 'none' }}
          open={false}
          showSearch={false}
          maxTagPlaceholder={omittedValues => (
            <Popover
              overlayStyle={{ pointerEvents: 'none' }}
              title=""
              content={omittedValues.map(({ label }) => (
                <div key={label?.toString() || 'impossible'}>{label}</div>
              ))}
            >
              <span>+{omittedValues.length}</span>
            </Popover>
          )}
          removeIcon={() => {
            return null
          }}
          suffixIcon={null}
        />
      ),
      width: 'auto',
    },
    {
      title: 'Action',
      dataIndex: 'defaultAction',
      key: 'defaultAction',
      width: 140,
      render: (_, { defaultAction }) => (
        <Tag color={defaultAction === 'ACCEPT' ? 'success' : 'error'}>{defaultAction}</Tag>
      ),
    },
    {
      title: 'Logs',
      dataIndex: 'logs',
      key: 'logs',
      width: 140,
      render: (_, { logs }) => <Switch value={logs} disabled />,
    },
    {
      title: 'Trace',
      dataIndex: 'trace',
      key: 'trace',
      width: 140,
      render: (_, { trace }) => <Switch value={trace} disabled />,
    },
    {
      title: '',
      key: 'controls',
      align: 'right',
      className: 'controls',
      width: 84,
      render: (_, record: TSecurityGroup) => (
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
        <TitleWithNoMargins level={3}>Security Groups</TitleWithNoMargins>
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
      {!securityGroups.length && !error && !isLoading && <CustomEmpty />}
      {securityGroups.length > 0 && (
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
              dataSource={securityGroups.map(row => ({ ...row, key: row.name }))}
              columns={columns}
              scroll={{ x: 'max-content' }}
              onChange={handleChange}
            />
          </TableComponents.HideableControls>
        </TableComponents.TableContainer>
      )}
      <SecurityGroupDeleteModal
        externalOpenInfo={isModalDeleteOpen}
        setExternalOpenInfo={setIsModalDeleteOpen}
        openNotification={openNotification}
        initSecurityGroups={securityGroups}
        setInitSecurityGroups={setSecurityGroups}
      />
      <SecurityGroupAddModal
        externalOpenInfo={isModalAddOpen}
        setExternalOpenInfo={setIsModalAddOpen}
        openNotification={openNotification}
        initSecurityGroups={securityGroups}
        setInitSecurityGroups={setSecurityGroups}
        nwResponse={nwResponse}
      />
      <SecurityGroupEditModal
        externalOpenInfo={isModalEditOpen}
        setExternalOpenInfo={setIsModalEditOpen}
        openNotification={openNotification}
        initSecurityGroups={securityGroups}
        setInitSecurityGroups={setSecurityGroups}
        nwResponse={nwResponse}
      />
      {contextHolder}
    </>
  )
}
