import React, { FC, useState, useEffect, useCallback } from 'react'
import { Result, Spin } from 'antd'
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
import {
  mapRulesSgSgFrom,
  mapRulesSgSgTo,
  mapRulesSgSgIcmpFrom,
  mapRulesSgSgIcmpTo,
  mapRulesSgSgIeFrom,
  mapRulesSgSgIeTo,
  mapRulesSgSgIeIcmpFrom,
  mapRulesSgSgIeIcmpTo,
  mapRulesSgFqdnTo,
  mapRulesSgCidrFrom,
  mapRulesSgCidrTo,
  mapRulesSgCidrIcmpFrom,
  mapRulesSgCidrIcmpTo,
  checkIfChangesExist,
} from './utils'
import { SelectCenterSgModal } from './atoms'
import { TransformBlock, BottomBar, RulesSpecific } from './populations'
import { Styled } from './styled'

type TRulesEditorProps = {
  id?: string
}

export const RulesEditor: FC<TRulesEditorProps> = ({ id }) => {
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

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCenterSg(id))
  }, [id, dispatch])

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
        getSgSgRulesBySgFrom(centerSg),
        getSgSgRulesBySgTo(centerSg),
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
            rulesSgFrom,
            rulesSgTo,
            rulesSgSgIcmpFrom,
            rulesSgSgIcmpTo,
            rulesSgSgIe,
            rulesSgSgIeIcmp,
            rulesFqdnTo,
            rulesCidrSg,
            rulesCidrSgIcmp,
          ]) => {
            dispatch(setRulesSgSgFrom(mapRulesSgSgFrom(rulesSgFrom.data.rules)))
            dispatch(setRulesSgSgTo(mapRulesSgSgTo(rulesSgTo.data.rules)))
            dispatch(setRulesSgSgIcmpFrom(mapRulesSgSgIcmpFrom(rulesSgSgIcmpFrom.data.rules)))
            dispatch(setRulesSgSgIcmpTo(mapRulesSgSgIcmpTo(rulesSgSgIcmpTo.data.rules)))
            dispatch(setRulesSgSgIeFrom(mapRulesSgSgIeFrom(rulesSgSgIe.data.rules)))
            dispatch(setRulesSgSgIeTo(mapRulesSgSgIeTo(rulesSgSgIe.data.rules)))
            dispatch(setRulesSgSgIeIcmpFrom(mapRulesSgSgIeIcmpFrom(rulesSgSgIeIcmp.data.rules)))
            dispatch(setRulesSgSgIeIcmpTo(mapRulesSgSgIeIcmpTo(rulesSgSgIeIcmp.data.rules)))
            dispatch(setRulesSgFqdnTo(mapRulesSgFqdnTo(rulesFqdnTo.data.rules)))
            dispatch(setRulesSgCidrFrom(mapRulesSgCidrFrom(rulesCidrSg.data.rules)))
            dispatch(setRulesSgCidrTo(mapRulesSgCidrTo(rulesCidrSg.data.rules)))
            dispatch(setRulesSgCidrIcmpFrom(mapRulesSgCidrIcmpFrom(rulesCidrSgIcmp.data.rules)))
            dispatch(setRulesSgCidrIcmpTo(mapRulesSgCidrIcmpTo(rulesCidrSgIcmp.data.rules)))
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
    const result = checkIfChangesExist({
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
    })
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
      {specificOpen && <RulesSpecific onSelectCenterSg={onSelectCenterSg} />}
      {!specificOpen && <TransformBlock onSelectCenterSg={onSelectCenterSg} />}
      <BottomBar onSubmit={() => fetchData()} />
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
