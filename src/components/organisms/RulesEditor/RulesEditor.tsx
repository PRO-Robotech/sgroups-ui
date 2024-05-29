import React, { FC, useState, useEffect, useCallback } from 'react'
import { Result, Spin } from 'antd'
import { AxiosError } from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from 'store/store'
import { setSgNames } from 'store/editor/sgNames/sgNames'
import { setCenterSg } from 'store/editor/centerSg/centerSg'
import { setSpecific } from 'store/editor/specific/specific'
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
import {
  mapRulesSgSg,
  mapRulesSgSgIcmp,
  mapRulesSgSgIe,
  mapRulesSgSgIeIcmp,
  mapRulesSgFqdn,
  mapRulesSgCidr,
  mapRulesSgCidrIcmp,
  checkIfChangesExist,
} from './utils'
import { VIEW_TYPE } from './constants'
import { SelectCenterSgModal } from './atoms'
import { TransformBlock, BottomBar, RulesSpecific, RulesSimplified } from './populations'
import { Styled } from './styled'

type TRulesEditorProps = {
  id?: string
}

export const RulesEditor: FC<TRulesEditorProps> = ({ id }) => {
  const dispatch = useDispatch()

  const lsViewtype = localStorage.getItem('viewType')
  const lsViewtypeRead = lsViewtype ? JSON.parse(lsViewtype) : undefined

  const [viewType, setViewType] = useState<string>(lsViewtypeRead || VIEW_TYPE.simple)
  const [isChangeCenterSgModalVisible, setChangeCenterSgModalVisible] = useState<boolean>(false)
  const [pendingSg, setPendingSg] = useState<string>()
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const specificOpen = useSelector((state: RootState) => state.specific.specificOpen)
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

  useEffect(() => {
    if (id) {
      dispatch(setCenterSg(id))
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
    }
    dispatch(setSpecific({ specificOpen: false, specificValue: undefined }))
  }, [id, dispatch])

  useEffect(() => {
    localStorage.setItem('viewType', JSON.stringify(viewType))
  }, [viewType])

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

  const onSelectCenterSg = (newSg?: string) => {
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

  if (error) {
    return (
      <Result
        status="error"
        title={error.status}
        subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
      />
    )
  }

  return (
    <Styled.Container>
      {viewType === VIEW_TYPE.overview && specificOpen && <RulesSpecific onSelectCenterSg={onSelectCenterSg} />}
      {viewType === VIEW_TYPE.overview && !specificOpen && <TransformBlock onSelectCenterSg={onSelectCenterSg} />}
      {viewType === VIEW_TYPE.simple && <RulesSimplified onSelectCenterSg={onSelectCenterSg} />}
      <BottomBar onSubmit={() => fetchData()} viewType={viewType} onViewTypeChange={setViewType} />
      {isLoading && (
        <Styled.Loader>
          <Spin size="large" />
        </Styled.Loader>
      )}
      <SelectCenterSgModal
        isOpen={isChangeCenterSgModalVisible}
        handleOk={() => {
          dispatch(setCenterSg(pendingSg))
          setChangeCenterSgModalVisible(false)
          setPendingSg(undefined)
        }}
        handleCancel={() => setChangeCenterSgModalVisible(false)}
      />
    </Styled.Container>
  )
}
