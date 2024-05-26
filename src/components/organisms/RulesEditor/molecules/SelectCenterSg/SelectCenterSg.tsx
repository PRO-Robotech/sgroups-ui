import React, { FC, useState, useEffect, useRef } from 'react'
import { Typography, Form, Select, Result, Spin } from 'antd'
import type { BaseSelectRef } from 'rc-select'
import { AxiosError } from 'axios'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Spacer, TitleWithNoTopMargin } from 'components'
import { getSecurityGroupByName } from 'api/securityGroups'
import { TSecurityGroup } from 'localTypes/securityGroups'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { filterSgName } from 'utils/filterSgName'
import { GroupRulesNodeWrapper } from '../../atoms'
import { TFieldData } from './types'
import { Styled } from './styled'

type TSelectCenterSgProps = {
  onSelectCenterSg: (value?: string) => void
  notInTransformBlock?: boolean
}

export const SelectCenterSg: FC<TSelectCenterSgProps> = ({ onSelectCenterSg, notInTransformBlock }) => {
  const [curValues, setCurValues] = useState<TFieldData[]>([{ name: 'name', value: undefined }])
  const [securityGroup, setSecurityGroup] = useState<TSecurityGroup>()
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const inputTagRef = useRef<BaseSelectRef>(null)

  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  useEffect(() => {
    if (inputTagRef.current) {
      inputTagRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (!centerSg) {
      setCurValues([{ name: 'name', value: undefined }])
      setSecurityGroup(undefined)
      setIsLoading(false)
      setError(undefined)
    } else {
      setCurValues([{ name: 'name', value: centerSg }])
      setIsLoading(true)
      getSecurityGroupByName(centerSg)
        .then(({ data }) => {
          setSecurityGroup(data.groups[0])
          setIsLoading(false)
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
    }
  }, [centerSg])

  return (
    <GroupRulesNodeWrapper $notInTransformBlock={notInTransformBlock} $isCenterSg>
      <TitleWithNoTopMargin level={4}>Main SG</TitleWithNoTopMargin>
      {!notInTransformBlock && (
        <Styled.Directions>
          <Typography.Text type="secondary">Ingress</Typography.Text>
          <Typography.Text type="secondary">Egress</Typography.Text>
        </Styled.Directions>
      )}
      <Spacer $space={10} $samespace />
      <Form
        fields={curValues}
        onFieldsChange={() => {
          // setCurValues(allFields)
        }}
      >
        <Styled.FormItem name="name">
          <Select
            showSearch
            allowClear
            onSelect={value => {
              if (inputTagRef.current) {
                inputTagRef.current.blur()
              }
              onSelectCenterSg(value)
            }}
            onClear={() => onSelectCenterSg(undefined)}
            placeholder="Select sg"
            optionFilterProp="children"
            filterOption={filterSgName}
            options={sgNames.map(el => ({
              value: el,
              label: el,
            }))}
            ref={inputTagRef}
          />
        </Styled.FormItem>
      </Form>
      <Spacer $space={10} $samespace />
      {error && <Result status="error" title={error.status} subTitle={error.data?.message} />}
      {isLoading && <Spin />}
      {securityGroup && (
        <Typography.Text type="secondary">Default Action: {securityGroup.defaultAction}</Typography.Text>
      )}
    </GroupRulesNodeWrapper>
  )
}
