/* eslint-disable react/no-unstable-nested-components */
import React, { FC } from 'react'
import { Popover, Tag } from 'antd'
import { TPortGroup } from 'localTypes/rules'
import { Styled } from './styled'

type TPortsCellProps = {
  ports?: TPortGroup[] | null
}

export const PortsCell: FC<TPortsCellProps> = ({ ports }) => {
  if (!ports || ports.length === 0) {
    return <Tag>All Ports : All Ports</Tag>
  }

  return (
    <Styled.UncontrolledSelect
      mode="multiple"
      maxTagCount="responsive"
      value={ports.map(({ s, d }) => ({
        label: `${!s || s.length === 0 ? 'All Ports' : s} : ${!d || d.length === 0 ? 'All Ports' : d}`,
        value: `${!s || s.length === 0 ? 'All Ports' : s} : ${!d || d.length === 0 ? 'All Ports' : d}`,
      }))}
      options={ports.map(({ s, d }) => ({
        label: `${!s || s.length === 0 ? 'All Ports' : s} : ${!d || d.length === 0 ? 'All Ports' : d}`,
        value: `${!s || s.length === 0 ? 'All Ports' : s} : ${!d || d.length === 0 ? 'All Ports' : d}`,
      }))}
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
      tagRender={({ label }) => <Tag>{label}</Tag>}
    />
  )
}
