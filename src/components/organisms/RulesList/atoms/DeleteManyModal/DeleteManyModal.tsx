import React, { FC, Dispatch, SetStateAction } from 'react'
import { Modal } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { setRulesSgSgIeFrom, setRulesSgSgIeTo } from 'store/editor/rulesSgSgIe/rulesSgSgIe'
import { setRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpTo } from 'store/editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { setRulesSgFqdnTo } from 'store/editor/rulesSgFqdn/rulesSgFqdn'
import { setRulesSgCidrFrom, setRulesSgCidrTo } from 'store/editor/rulesSgCidr/rulesSgCidr'
import { setRulesSgCidrIcmpFrom, setRulesSgCidrIcmpTo } from 'store/editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import { STATUSES } from 'constants/rules'

type TDeleteManyModalProps = {
  externalOpenInfo: boolean
  setExternalOpenInfo: Dispatch<SetStateAction<boolean>>
  openNotification?: (msg: string) => void
}

export const DeleteManyModal: FC<TDeleteManyModalProps> = ({
  externalOpenInfo,
  setExternalOpenInfo,
  openNotification,
}) => {
  const dispatch = useDispatch()
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

  const removeNetworkFromList = () => {
    /* mark as deleted and uncheck */
    const newRulesSgSgFrom = [
      ...rulesSgSgFrom
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgFrom.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgTo = [
      ...rulesSgSgTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgTo.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgIcmpFrom = [
      ...rulesSgSgIcmpFrom
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgIcmpFrom.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgIcmpTo = [
      ...rulesSgSgIcmpTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgIcmpTo.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgIeFrom = [
      ...rulesSgSgIeFrom
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgIeFrom.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgIeTo = [
      ...rulesSgSgIeTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgIeTo.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgIeIcmpFrom = [
      ...rulesSgSgIeIcmpFrom
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgIeIcmpFrom.filter(({ checked }) => checked === false),
    ]
    const newRulesSgSgIeIcmpTo = [
      ...rulesSgSgIeIcmpTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgSgIeIcmpTo.filter(({ checked }) => checked === false),
    ]
    const newRulesSgFqdnTo = [
      ...rulesSgFqdnTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgFqdnTo.filter(({ checked }) => checked === false),
    ]
    const newRulesSgCidrFrom = [
      ...rulesSgCidrFrom
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgCidrFrom.filter(({ checked }) => checked === false),
    ]
    const newRulesSgCidrTo = [
      ...rulesSgCidrTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgCidrTo.filter(({ checked }) => checked === false),
    ]
    const newRulesSgCidrIcmpFrom = [
      ...rulesSgCidrIcmpFrom
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgCidrIcmpFrom.filter(({ checked }) => checked === false),
    ]
    const newRulesSgCidrIcmpTo = [
      ...rulesSgCidrIcmpTo
        .filter(({ checked }) => checked === true)
        .map(el => ({ ...el, formChanges: { ...el.formChanges, status: STATUSES.deleted }, checked: false })),
      ...rulesSgCidrIcmpTo.filter(({ checked }) => checked === false),
    ]

    dispatch(setRulesSgSgFrom(newRulesSgSgFrom))
    dispatch(setRulesSgSgTo(newRulesSgSgTo))
    dispatch(setRulesSgFqdnTo(newRulesSgFqdnTo))
    dispatch(setRulesSgCidrFrom(newRulesSgCidrFrom))
    dispatch(setRulesSgCidrTo(newRulesSgCidrTo))
    dispatch(setRulesSgSgIcmpFrom(newRulesSgSgIcmpFrom))
    dispatch(setRulesSgSgIcmpTo(newRulesSgSgIcmpTo))
    dispatch(setRulesSgSgIeFrom(newRulesSgSgIeFrom))
    dispatch(setRulesSgSgIeTo(newRulesSgSgIeTo))
    dispatch(setRulesSgSgIeIcmpFrom(newRulesSgSgIeIcmpFrom))
    dispatch(setRulesSgSgIeIcmpTo(newRulesSgSgIeIcmpTo))
    dispatch(setRulesSgCidrIcmpFrom(newRulesSgCidrIcmpFrom))
    dispatch(setRulesSgCidrIcmpTo(newRulesSgCidrIcmpTo))

    setExternalOpenInfo(false)
    if (openNotification) {
      openNotification('Rules Deleted')
    }
  }

  return (
    <Modal
      title="Delete Selected Rules?"
      open={externalOpenInfo}
      onOk={() => removeNetworkFromList()}
      onCancel={() => {
        setExternalOpenInfo(false)
      }}
      okText="Delete"
      okButtonProps={{ danger: true }}
    />
  )
}
