/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect, useCallback } from 'react'
import { Result, Spin, notification, Button } from 'antd'
import { TrashSimple, MagnifyingGlass, X } from '@phosphor-icons/react'
import { AxiosError } from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from 'store/store'
import { setSgNames } from 'store/editor/sgNames/sgNames'
import { setCenterSg } from 'store/editor/centerSg/centerSg'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { setRulesSgSgIeFrom, setRulesSgSgIeTo } from 'store/editor/rulesSgSgIe/rulesSgSgIe'
import { setRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpTo } from 'store/editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { setRulesSgFqdnTo } from 'store/editor/rulesSgFqdn/rulesSgFqdn'
import { setRulesSgCidrFrom, setRulesSgCidrTo } from 'store/editor/rulesSgCidr/rulesSgCidr'
import { setRulesSgCidrIcmpFrom, setRulesSgCidrIcmpTo } from 'store/editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { getSecurityGroups } from 'api/securityGroups'
import {
  getSgSgRulesBySgFrom,
  getSgSgRulesBySgTo,
  getSgSgIcmpRulesBySgFrom,
  getSgSgIcmpRulesBySgTo,
  getSgSgIeRulesBySgLocal,
  getSgSgIeIcmpRulesBySgLocal,
  getSgFqdnRulesBySgFrom,
  getSgCidrRulesBySg,
  getSgCidrIcmpRulesBySg,
} from 'api/rules'
import { TitleWithNoMargins, Layouts, MiddleContainer } from 'components'
import {
  mapRulesSgSg,
  mapRulesSgSgIcmp,
  mapRulesSgSgIe,
  mapRulesSgSgIeIcmp,
  mapRulesSgFqdn,
  mapRulesSgCidr,
  mapRulesSgCidrIcmp,
  checkIfChangesExist,
  countChanges,
  getSectionName,
} from './utils'
import { SelectCenterSgModal, DeleteManyModal } from './atoms'
import { CustomNotification } from './molecules'
import { SgSelectAndTypeSwitcher, ChangesBlock } from './organisms'
import { RulesByType } from './populations'
import { Styled } from './styled'

type TRulesListProps = {
  typeId: string
}

export const RulesList: FC<TRulesListProps> = ({ typeId }) => {
  const dispatch = useDispatch()
  const [api, contextHolder] = notification.useNotification()

  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [isChangeCenterSgModalVisible, setChangeCenterSgModalVisible] = useState<boolean>(false)
  const [pendingSg, setPendingSg] = useState<string>()

  const [formChangesCount, setFormChangesCount] = useState<number>(0)
  const [isChangesBlockVisible, setIsChangesBlockVisible] = useState<boolean>(false)

  const [subType, setSubType] = useState<string>('TCP/UDP')

  const [searchText, setSearchText] = useState('')
  const [checkboxRowSelected, setCheckboxRowSelected] = useState<number>(0)
  const [isModalDeleteManyOpen, setIsModalDeleteManyOpen] = useState<boolean>(false)

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

  /* return subtype if type is changed */
  useEffect(() => {
    setSubType('TCP/UDP')
  }, [typeId])

  /* get available sg names */
  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSecurityGroups()
      .then(({ data }) => {
        const sgNames = data.groups.map(({ name }) => name)
        dispatch(setSgNames(sgNames))
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
  }, [dispatch])

  /* clean even if trying to dispatch rules when center sg is no longer provided */
  useEffect(() => {
    if (!centerSg) {
      dispatch(setRulesSgSgFrom([]))
      dispatch(setRulesSgSgTo([]))
      dispatch(setRulesSgFqdnTo([]))
      dispatch(setRulesSgCidrFrom([]))
      dispatch(setRulesSgCidrTo([]))
      dispatch(setRulesSgSgIcmpFrom([]))
      dispatch(setRulesSgSgIcmpTo([]))
      dispatch(setRulesSgSgIeFrom([]))
      dispatch(setRulesSgSgIeTo([]))
      dispatch(setRulesSgSgIeIcmpFrom([]))
      dispatch(setRulesSgSgIeIcmpTo([]))
      dispatch(setRulesSgCidrIcmpFrom([]))
      dispatch(setRulesSgCidrIcmpTo([]))
      setError(undefined)
    }
  }, [
    centerSg,
    dispatch,
    rulesSgSgFrom.length,
    rulesSgSgTo.length,
    rulesSgSgIcmpFrom.length,
    rulesSgSgIcmpTo.length,
    rulesSgSgIeFrom.length,
    rulesSgSgIeTo.length,
    rulesSgSgIeIcmpFrom.length,
    rulesSgSgIeIcmpTo.length,
    rulesSgFqdnTo.length,
    rulesSgCidrFrom.length,
    rulesSgCidrTo.length,
    rulesSgCidrIcmpFrom.length,
    rulesSgCidrIcmpTo.length,
  ])

  /* fetching rules */
  const fetchData = useCallback(() => {
    if (centerSg) {
      setIsLoading(true)
      setError(undefined)
      Promise.all([
        getSgSgRulesBySgTo(centerSg),
        getSgSgRulesBySgFrom(centerSg),
        getSgSgIcmpRulesBySgTo(centerSg),
        getSgSgIcmpRulesBySgFrom(centerSg),
        getSgSgIeRulesBySgLocal(centerSg),
        getSgSgIeIcmpRulesBySgLocal(centerSg),
        getSgFqdnRulesBySgFrom(centerSg),
        getSgCidrRulesBySg(centerSg),
        getSgCidrIcmpRulesBySg(centerSg),
      ])
        .then(
          ([
            rulesBySgTo,
            rulesBySgFrom,
            rulesSgSgIcmpBySgTo,
            rulesSgSgIcmpBySgFrom,
            rulesSgSgIe,
            rulesSgSgIeIcmp,
            rulesFqdnBySgFrom,
            rulesCidrSg,
            rulesCidrSgIcmp,
          ]) => {
            dispatch(setRulesSgSgFrom(mapRulesSgSg(rulesBySgTo.data.rules, 'Ingress')))
            dispatch(setRulesSgSgTo(mapRulesSgSg(rulesBySgFrom.data.rules, 'Egress')))
            dispatch(setRulesSgSgIcmpFrom(mapRulesSgSgIcmp(rulesSgSgIcmpBySgTo.data.rules, 'Ingress')))
            dispatch(setRulesSgSgIcmpTo(mapRulesSgSgIcmp(rulesSgSgIcmpBySgFrom.data.rules, 'Egress')))
            dispatch(setRulesSgSgIeFrom(mapRulesSgSgIe(rulesSgSgIe.data.rules, 'Ingress')))
            dispatch(setRulesSgSgIeTo(mapRulesSgSgIe(rulesSgSgIe.data.rules, 'Egress')))
            dispatch(setRulesSgSgIeIcmpFrom(mapRulesSgSgIeIcmp(rulesSgSgIeIcmp.data.rules, 'Ingress')))
            dispatch(setRulesSgSgIeIcmpTo(mapRulesSgSgIeIcmp(rulesSgSgIeIcmp.data.rules, 'Egress')))
            dispatch(setRulesSgFqdnTo(mapRulesSgFqdn(rulesFqdnBySgFrom.data.rules)))
            dispatch(setRulesSgCidrFrom(mapRulesSgCidr(rulesCidrSg.data.rules, 'Ingress')))
            dispatch(setRulesSgCidrTo(mapRulesSgCidr(rulesCidrSg.data.rules, 'Egress')))
            dispatch(setRulesSgCidrIcmpFrom(mapRulesSgCidrIcmp(rulesCidrSgIcmp.data.rules, 'Ingress')))
            dispatch(setRulesSgCidrIcmpTo(mapRulesSgCidrIcmp(rulesCidrSgIcmp.data.rules, 'Egress')))
            setIsLoading(false)
          },
        )
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
    } else {
      dispatch(setRulesSgSgFrom([]))
      dispatch(setRulesSgSgTo([]))
      dispatch(setRulesSgFqdnTo([]))
      dispatch(setRulesSgCidrFrom([]))
      dispatch(setRulesSgCidrTo([]))
      dispatch(setRulesSgSgIcmpFrom([]))
      dispatch(setRulesSgSgIcmpTo([]))
      dispatch(setRulesSgSgIeFrom([]))
      dispatch(setRulesSgSgIeTo([]))
      dispatch(setRulesSgSgIeIcmpFrom([]))
      dispatch(setRulesSgSgIeIcmpTo([]))
      dispatch(setRulesSgCidrIcmpFrom([]))
      dispatch(setRulesSgCidrIcmpTo([]))
      setError(undefined)
    }
  }, [dispatch, centerSg])

  useEffect(() => {
    fetchData()
  }, [centerSg, fetchData])

  /* get checked rows */
  useEffect(() => {
    const checkedQuantity =
      rulesSgSgFrom.filter(({ checked }) => checked === true).length +
      rulesSgSgTo.filter(({ checked }) => checked === true).length +
      rulesSgSgIcmpFrom.filter(({ checked }) => checked === true).length +
      rulesSgSgIcmpTo.filter(({ checked }) => checked === true).length +
      rulesSgSgIeFrom.filter(({ checked }) => checked === true).length +
      rulesSgSgIeTo.filter(({ checked }) => checked === true).length +
      rulesSgSgIeIcmpFrom.filter(({ checked }) => checked === true).length +
      rulesSgSgIeIcmpTo.filter(({ checked }) => checked === true).length +
      rulesSgFqdnTo.filter(({ checked }) => checked === true).length +
      rulesSgCidrFrom.filter(({ checked }) => checked === true).length +
      rulesSgCidrTo.filter(({ checked }) => checked === true).length +
      rulesSgCidrIcmpFrom.filter(({ checked }) => checked === true).length +
      rulesSgCidrIcmpTo.filter(({ checked }) => checked === true).length
    setCheckboxRowSelected(checkedQuantity)
  }, [
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

  /* show form changes modal */
  useEffect(() => {
    const count =
      countChanges(rulesSgSgFrom) +
      countChanges(rulesSgSgTo) +
      countChanges(rulesSgSgIcmpFrom) +
      countChanges(rulesSgSgIcmpTo) +
      countChanges(rulesSgSgIeFrom) +
      countChanges(rulesSgSgIeTo) +
      countChanges(rulesSgSgIeIcmpFrom) +
      countChanges(rulesSgSgIeIcmpTo) +
      countChanges(rulesSgFqdnTo) +
      countChanges(rulesSgCidrFrom) +
      countChanges(rulesSgCidrTo) +
      countChanges(rulesSgCidrIcmpFrom) +
      countChanges(rulesSgCidrIcmpTo)
    setFormChangesCount(count)
  }, [
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

  if (error) {
    return (
      <MiddleContainer>
        <Result status="error" title={error.status} subTitle={error.data?.message} />
      </MiddleContainer>
    )
  }

  /* show modal if some changes are not submitted */
  const onSelectCenterSg = (newSg?: string) => {
    if (newSg !== centerSg) {
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
        setPendingSg(newSg)
        setChangeCenterSgModalVisible(true)
      } else {
        dispatch(setCenterSg(newSg))
      }
    }
  }

  const openNotification = (msg: string) => {
    api.success({
      message: msg,
      placement: 'topRight',
    })
  }

  const clearSelected = () => {
    const newRulesSgSgFrom = rulesSgSgFrom.map(el => ({ ...el, checked: false }))
    const newRulesSgSgTo = rulesSgSgTo.map(el => ({ ...el, checked: false }))
    const newRulesSgSgIcmpFrom = rulesSgSgIcmpFrom.map(el => ({ ...el, checked: false }))
    const newRulesSgSgIcmpTo = rulesSgSgIcmpTo.map(el => ({ ...el, checked: false }))
    const newRulesSgSgIeFrom = rulesSgSgIeFrom.map(el => ({ ...el, checked: false }))
    const newRulesSgSgIeTo = rulesSgSgIeTo.map(el => ({ ...el, checked: false }))
    const newRulesSgSgIeIcmpFrom = rulesSgSgIeIcmpFrom.map(el => ({ ...el, checked: false }))
    const newRulesSgSgIeIcmpTo = rulesSgSgIeIcmpTo.map(el => ({ ...el, checked: false }))
    const newRulesSgFqdnTo = rulesSgFqdnTo.map(el => ({ ...el, checked: false }))
    const newRulesSgCidrFrom = rulesSgCidrFrom.map(el => ({ ...el, checked: false }))
    const newRulesSgCidrTo = rulesSgCidrTo.map(el => ({ ...el, checked: false }))
    const newRulesSgCidrIcmpFrom = rulesSgCidrIcmpFrom.map(el => ({ ...el, checked: false }))
    const newRulesSgCidrIcmpTo = rulesSgCidrIcmpTo.map(el => ({ ...el, checked: false }))

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
  }

  return (
    <>
      <Layouts.HeaderRow>
        <TitleWithNoMargins level={3}>{getSectionName(typeId)}</TitleWithNoMargins>
      </Layouts.HeaderRow>
      <Layouts.ControlsRow>
        <Layouts.ControlsRightSide>
          {checkboxRowSelected > 0 && (
            <>
              <Styled.SelectedItemsText>Selected Rules: {checkboxRowSelected}</Styled.SelectedItemsText>
              <Button type="text" icon={<X size={16} color="#00000073" />} onClick={clearSelected} />
            </>
          )}
          <SgSelectAndTypeSwitcher
            isHidden={checkboxRowSelected > 0}
            onSelectCenterSg={onSelectCenterSg}
            typeId={typeId}
            subType={subType}
            onSelectSubType={setSubType}
          />
          <Layouts.Separator />
          <Button
            disabled={checkboxRowSelected === 0}
            type="text"
            icon={<TrashSimple size={18} />}
            onClick={() => setIsModalDeleteManyOpen(true)}
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
      {!isLoading && <RulesByType typeId={typeId} subType={subType} />}
      <SelectCenterSgModal
        isOpen={isChangeCenterSgModalVisible}
        handleOk={() => {
          dispatch(setCenterSg(pendingSg))
          setChangeCenterSgModalVisible(false)
          setPendingSg(undefined)
        }}
        handleCancel={() => setChangeCenterSgModalVisible(false)}
      />
      <DeleteManyModal
        externalOpenInfo={isModalDeleteManyOpen}
        setExternalOpenInfo={setIsModalDeleteManyOpen}
        openNotification={openNotification}
      />
      {formChangesCount > 0 && !isChangesBlockVisible && (
        <CustomNotification changesCount={formChangesCount} openChangesBlock={() => setIsChangesBlockVisible(true)} />
      )}
      {centerSg && isChangesBlockVisible && (
        <ChangesBlock
          centerSg={centerSg}
          isOpen={isChangesBlockVisible}
          onClose={() => setIsChangesBlockVisible(false)}
          onSubmit={() => {
            fetchData()
            openNotification('Changes Saved')
            setIsChangesBlockVisible(false)
          }}
        />
      )}
      {contextHolder}
    </>
  )
}
