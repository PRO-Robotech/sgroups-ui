import React, { FC, useEffect, Dispatch, SetStateAction } from 'react'
import { Form, Select, Segmented } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { filterSgName } from 'utils/filterSgName'
import { Styled } from './styled'

type TSgSelectAndTypeSwitcherProps = {
  onSelectCenterSg: (value?: string) => void
  typeId: string
  subType: string
  onSelectSubType: Dispatch<SetStateAction<string>>
  isHidden: boolean
}

export const SgSelectAndTypeSwitcher: FC<TSgSelectAndTypeSwitcherProps> = ({
  onSelectCenterSg,
  typeId,
  subType,
  onSelectSubType,
  isHidden,
}) => {
  const [form] = Form.useForm<{ name: string }>()
  const name = Form.useWatch<string>('name', form)

  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)

  useEffect(() => {
    onSelectCenterSg(name)
  }, [name, onSelectCenterSg])

  return (
    <Styled.Container $isHidden={isHidden}>
      Main Security Group:
      <Form<{ name: string }> form={form}>
        <Styled.CustomFormItem name="name">
          <Select
            showSearch
            allowClear
            placeholder="Select security group"
            optionFilterProp="children"
            filterOption={filterSgName}
            options={sgNames.map(el => ({
              value: el,
              label: el,
            }))}
          />
        </Styled.CustomFormItem>
      </Form>
      {typeId !== 'sgFqdn' && (
        <Segmented options={['TCP/UDP', 'ICMP']} value={subType} onChange={value => onSelectSubType(value as string)} />
      )}
    </Styled.Container>
  )
}
