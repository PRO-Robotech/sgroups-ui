/* eslint-disable camelcase */
import React, { Dispatch, FC, SetStateAction, useState } from 'react'
import { Card, Typography, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Spacer } from 'components'
import { TEntry } from 'localTypes/graph'
import { ITEMS_PER_PAGE } from 'constants/graph'
import { TColumns } from './types'
import { filterColumns } from './utils'
import { ColumnFilter } from './molecules'
import { Styled } from './styled'

type TTableViewProps = {
  data: TEntry[]
  isExtended: boolean
  setIsExtended: Dispatch<SetStateAction<boolean>>
}

export const TableView: FC<TTableViewProps> = ({ data, isExtended, setIsExtended }) => {
  const [hiddenCols, setHiddenCols] = useState<string[]>()

  const dataSource = data.map(row => ({ ...row, key: row.uuid }))
  const columns: ColumnsType<TColumns> = [
    {
      title: 'src NW',
      dataIndex: 'src_ip',
      key: 'src_ip',
      width: 100,
    },
    {
      title: 'src port',
      dataIndex: 'src_port',
      key: 'src_port',
      width: 50,
    },
    {
      title: 'dst NW',
      dataIndex: 'dst_ip',
      key: 'dst_ip',
      width: 100,
    },
    {
      title: 'dst port',
      dataIndex: 'dst_port',
      key: 'dst_port',
      width: 50,
    },
    {
      title: 'transport',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 150,
    },
    {
      title: 'from',
      dataIndex: 'from',
      key: 'from',
      width: 150,
    },
    {
      title: 'to',
      dataIndex: 'to',
      key: 'to',
      width: 150,
    },
  ]

  return (
    <Styled.Container>
      <Card>
        <Styled.TitleContainer onClick={() => setIsExtended(!isExtended)}>
          <Typography.Title level={3}>Data Table</Typography.Title>
          <Styled.TitleIconsContainer>
            {isExtended && <UpOutlined />}
            {!isExtended && <DownOutlined />}
          </Styled.TitleIconsContainer>
        </Styled.TitleContainer>
        {isExtended && (
          <>
            <ColumnFilter onHiddenColsChange={setHiddenCols} />
            <Spacer $space={15} $samespace />
            <Table
              pagination={{
                position: ['bottomCenter'],
                showQuickJumper: true,
                showSizeChanger: false,
                defaultPageSize: ITEMS_PER_PAGE,
                hideOnSinglePage: true,
              }}
              size="small"
              dataSource={dataSource}
              columns={filterColumns(columns, hiddenCols)}
              scroll={{ x: 'max-content' }}
            />
          </>
        )}
      </Card>
    </Styled.Container>
  )
}
