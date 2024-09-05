import React, { FC, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Form, Select, Segmented } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from 'store/store'
import { setCenterSg } from 'store/editor/centerSg/centerSg'
import { filterSgName } from 'utils/filterSgName'
import { SelectCenterSgModal } from '../../atoms'
import { checkIfChangesExist } from './utils'
import { Styled } from './styled'

type TSgSelectAndTypeSwitcherProps = {
  typeId: string
  subType: string
  onSelectSubType: Dispatch<SetStateAction<string>>
  isHidden: boolean
}

export const SgSelectAndTypeSwitcher: FC<TSgSelectAndTypeSwitcherProps> = ({
  typeId,
  subType,
  onSelectSubType,
  isHidden,
}) => {
  const dispatch = useDispatch()

  const [form] = Form.useForm<{ name: string }>()
  const name = Form.useWatch<string>('name', form)

  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)

  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)
  const rulesSgSgIeFrom = useSelector((state: RootState) => state.rulesSgSgIe.rulesFrom)
  const rulesSgSgIeTo = useSelector((state: RootState) => state.rulesSgSgIe.rulesTo)
  const rulesSgSgIeIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesFrom)
  const rulesSgSgIeIcmpTo = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesTo)
  const rulesSgFqdnTo = useSelector((state: RootState) => state.rulesSgFqdn.rulesTo)
  const rulesSgCidrFrom = useSelector((state: RootState) => state.rulesSgCidr.rulesFrom)
  const rulesSgCidrTo = useSelector((state: RootState) => state.rulesSgCidr.rulesTo)
  const rulesSgCidrIcmpFrom = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesFrom)
  const rulesSgCidrIcmpTo = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesTo)

  const [isChangeCenterSgModalVisible, setChangeCenterSgModalVisible] = useState<boolean>(false)
  const [pendingSg, setPendingSg] = useState<string>()

  useEffect(() => {
    if (name !== centerSg) {
      const result = checkIfChangesExist([
        ...rulesSgSgFrom,
        ...rulesSgSgTo,
        ...rulesSgSgIcmpFrom,
        ...rulesSgSgIcmpTo,
        ...rulesSgSgIeFrom,
        ...rulesSgSgIeTo,
        ...rulesSgSgIeIcmpFrom,
        ...rulesSgSgIeIcmpTo,
        ...rulesSgFqdnTo,
        ...rulesSgCidrFrom,
        ...rulesSgCidrTo,
        ...rulesSgCidrIcmpFrom,
        ...rulesSgCidrIcmpTo,
      ])
      if (result) {
        setPendingSg(name)
        setChangeCenterSgModalVisible(true)
      } else {
        dispatch(setCenterSg(name))
      }
    }
  }, [
    dispatch,
    name,
    centerSg,
    rulesSgSgFrom,
    rulesSgSgTo,
    rulesSgSgIcmpFrom,
    rulesSgSgIcmpTo,
    rulesSgSgIeFrom,
    rulesSgSgIeTo,
    rulesSgSgIeIcmpFrom,
    rulesSgSgIeIcmpTo,
    rulesSgFqdnTo,
    rulesSgCidrFrom,
    rulesSgCidrTo,
    rulesSgCidrIcmpFrom,
    rulesSgCidrIcmpTo,
  ])

  return (
    <>
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
          <Segmented
            options={['TCP/UDP', 'ICMP']}
            value={subType}
            onChange={value => onSelectSubType(value as string)}
          />
        )}
      </Styled.Container>
      <SelectCenterSgModal
        isOpen={isChangeCenterSgModalVisible}
        handleOk={() => {
          dispatch(setCenterSg(pendingSg))
          setChangeCenterSgModalVisible(false)
          setPendingSg(undefined)
        }}
        handleCancel={() => {
          setChangeCenterSgModalVisible(false)
          form.setFieldValue('name', centerSg)
        }}
      />
    </>
  )
}
