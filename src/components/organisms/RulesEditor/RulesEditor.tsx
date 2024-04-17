import React, { FC, useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { Result, Spin } from 'antd'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import {
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
} from 'localTypes/rules'
import { getSecurityGroups } from 'api/securityGroups'
import {
  getRulesBySGFrom,
  getRulesBySGTo,
  getFqdnRulesBySGFrom,
  getCidrSgRulesBySG,
  getSgSgIcmpRulesBySgFrom,
  getSgSgIcmpRulesBySgTo,
  getSgSgIeRulesBySgLocal,
  getSgSgIeIcmpRulesBySgLocal,
} from 'api/rules'
import { TransformBlock, BottomBar } from './organisms'
import {
  mapRulesSgFrom,
  mapRulesSgTo,
  mapRulesFqdnTo,
  mapRulesCidrSgFrom,
  mapRulesCidrSgTo,
  mapRulesSgSgIcmpFrom,
  mapRulesSgSgIcmpTo,
  mapRulesSgSgIeFrom,
  mapRulesSgSgIeTo,
  mapRulesSgSgIeIcmpFrom,
  mapRulesSgSgIeIcmpTo,
  checkIfChangesExist,
} from './utils'
import { SelectMainSgModal } from './atoms'
import { Styled } from './styled'

type TRulesEditorProps = {
  id?: string
}

export const RulesEditor: FC<TRulesEditorProps> = ({ id }) => {
  const [sgNames, setSgNames] = useState<string[]>([])
  const [centerSg, setCenterSg] = useState<string>()
  const [rulesSgFrom, setRulesSgFrom] = useState<TFormSgRule[]>([])
  const [rulesSgTo, setRulesSgTo] = useState<TFormSgRule[]>([])
  const [rulesFqdnTo, setRulesFqdnTo] = useState<TFormFqdnRule[]>([])
  const [rulesCidrSgFrom, setRulesCidrSgFrom] = useState<TFormCidrSgRule[]>([])
  const [rulesCidrSgTo, setRulesCidrSgTo] = useState<TFormCidrSgRule[]>([])
  const [rulesSgSgIcmpFrom, setRulesSgSgIcmpFrom] = useState<TFormSgSgIcmpRule[]>([])
  const [rulesSgSgIcmpTo, setRulesSgSgIcmpTo] = useState<TFormSgSgIcmpRule[]>([])
  const [rulesSgSgIeFrom, setRulesSgSgIeFrom] = useState<TFormSgSgIeRule[]>([])
  const [rulesSgSgIeTo, setRulesSgSgIeTo] = useState<TFormSgSgIeRule[]>([])
  const [rulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpFrom] = useState<TFormSgSgIeIcmpRule[]>([])
  const [rulesSgSgIeIcmpTo, setRulesSgSgIeIcmpTo] = useState<TFormSgSgIeIcmpRule[]>([])
  const [isChangeMainSgModalVisible, setChangeMainSgModalVisible] = useState<boolean>(false)
  const [pendingSg, setPendingSg] = useState<string>()
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    setError(undefined)
    getSecurityGroups()
      .then(({ data }) => {
        const sgNames = data.groups.map(({ name }) => name)
        setSgNames(sgNames)
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
  }, [])

  const fetchData = (centerSg?: string) => {
    if (centerSg) {
      setIsLoading(true)
      setRulesSgFrom([])
      setRulesSgTo([])
      setRulesFqdnTo([])
      setRulesCidrSgFrom([])
      setRulesCidrSgTo([])
      setRulesSgSgIcmpFrom([])
      setRulesSgSgIcmpTo([])
      setRulesSgSgIeFrom([])
      setRulesSgSgIeTo([])
      setRulesSgSgIeIcmpFrom([])
      setRulesSgSgIeIcmpTo([])
      setError(undefined)
      Promise.all([
        getRulesBySGTo(centerSg),
        getRulesBySGFrom(centerSg),
        getFqdnRulesBySGFrom(centerSg),
        getCidrSgRulesBySG(centerSg),
        getSgSgIcmpRulesBySgTo(centerSg),
        getSgSgIcmpRulesBySgFrom(centerSg),
        getSgSgIeRulesBySgLocal(centerSg),
        getSgSgIeIcmpRulesBySgLocal(centerSg),
      ])
        .then(
          ([
            rulesSgFrom,
            rulesSgTo,
            rulesFqdnTo,
            rulesCidrSg,
            rulesSgSgIcmpFrom,
            rulesSgSgIcmpTo,
            rulesSgSgIe,
            rulesSgSgIeIcmp,
          ]) => {
            setRulesSgFrom(mapRulesSgFrom(rulesSgFrom.data.rules))
            setRulesSgTo(mapRulesSgTo(rulesSgTo.data.rules))
            setRulesFqdnTo(mapRulesFqdnTo(rulesFqdnTo.data.rules))
            setRulesCidrSgFrom(mapRulesCidrSgFrom(rulesCidrSg.data.rules))
            setRulesCidrSgTo(mapRulesCidrSgTo(rulesCidrSg.data.rules))
            setRulesSgSgIcmpFrom(mapRulesSgSgIcmpFrom(rulesSgSgIcmpFrom.data.rules))
            setRulesSgSgIcmpTo(mapRulesSgSgIcmpTo(rulesSgSgIcmpTo.data.rules))
            setRulesSgSgIeFrom(mapRulesSgSgIeFrom(rulesSgSgIe.data.rules))
            setRulesSgSgIeTo(mapRulesSgSgIeTo(rulesSgSgIe.data.rules))
            setRulesSgSgIeIcmpFrom(mapRulesSgSgIeIcmpFrom(rulesSgSgIeIcmp.data.rules))
            setRulesSgSgIeIcmpTo(mapRulesSgSgIeIcmpTo(rulesSgSgIeIcmp.data.rules))
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
      setRulesSgFrom([])
      setRulesSgTo([])
      setRulesFqdnTo([])
      setRulesCidrSgFrom([])
      setRulesCidrSgTo([])
      setRulesSgSgIcmpFrom([])
      setRulesSgSgIcmpTo([])
      setRulesSgSgIeFrom([])
      setRulesSgSgIeTo([])
      setRulesSgSgIeIcmpFrom([])
      setRulesSgSgIeIcmpTo([])
      setError(undefined)
    }
  }

  const onSelectMainSg = (newSg?: string) => {
    const result = checkIfChangesExist(
      rulesSgFrom,
      rulesSgTo,
      rulesFqdnTo,
      rulesCidrSgFrom,
      rulesCidrSgTo,
      rulesSgSgIcmpFrom,
      rulesSgSgIcmpTo,
      rulesSgSgIeFrom,
      rulesSgSgIeTo,
      rulesSgSgIeIcmpFrom,
      rulesSgSgIeIcmpTo,
    )
    if (result) {
      setPendingSg(newSg)
      setChangeMainSgModalVisible(true)
    } else {
      setCenterSg(newSg)
    }
  }

  useEffect(() => {
    fetchData(centerSg)
  }, [centerSg])

  useEffect(() => {
    setCenterSg(id)
  }, [id])

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
      <TransformBlock
        sgNames={sgNames}
        centerSg={centerSg}
        onSelectMainSg={onSelectMainSg}
        rulesSgFrom={rulesSgFrom}
        setRulesSgFrom={setRulesSgFrom}
        rulesSgTo={rulesSgTo}
        setRulesSgTo={setRulesSgTo}
        rulesFqdnTo={rulesFqdnTo}
        setRulesFqdnTo={setRulesFqdnTo}
        rulesCidrSgFrom={rulesCidrSgFrom}
        setRulesCidrSgFrom={setRulesCidrSgFrom}
        rulesCidrSgTo={rulesCidrSgTo}
        setRulesCidrSgTo={setRulesCidrSgTo}
        rulesSgSgIcmpFrom={rulesSgSgIcmpFrom}
        setRulesSgSgIcmpFrom={setRulesSgSgIcmpFrom}
        rulesSgSgIcmpTo={rulesSgSgIcmpTo}
        setRulesSgSgIcmpTo={setRulesSgSgIcmpTo}
        rulesSgSgIeFrom={rulesSgSgIeFrom}
        setRulesSgSgIeFrom={setRulesSgSgIeFrom}
        rulesSgSgIeTo={rulesSgSgIeTo}
        setRulesSgSgIeTo={setRulesSgSgIeTo}
        rulesSgSgIeIcmpFrom={rulesSgSgIeIcmpFrom}
        setRulesSgSgIeIcmpFrom={setRulesSgSgIeIcmpFrom}
        rulesSgSgIeIcmpTo={rulesSgSgIeIcmpTo}
        setRulesSgSgIeIcmpTo={setRulesSgSgIeIcmpTo}
      />
      <BottomBar
        sgNames={sgNames}
        centerSg={centerSg}
        onSubmit={() => fetchData(centerSg)}
        rulesSgFrom={rulesSgFrom}
        setRulesSgFrom={setRulesSgFrom}
        rulesSgTo={rulesSgTo}
        setRulesSgTo={setRulesSgTo}
        rulesFqdnTo={rulesFqdnTo}
        setRulesFqdnTo={setRulesFqdnTo}
        rulesCidrSgFrom={rulesCidrSgFrom}
        setRulesCidrSgFrom={setRulesCidrSgFrom}
        rulesCidrSgTo={rulesCidrSgTo}
        setRulesCidrSgTo={setRulesCidrSgTo}
        rulesSgSgIcmpFrom={rulesSgSgIcmpFrom}
        setRulesSgSgIcmpFrom={setRulesSgSgIcmpFrom}
        rulesSgSgIcmpTo={rulesSgSgIcmpTo}
        setRulesSgSgIcmpTo={setRulesSgSgIcmpTo}
        rulesSgSgIeFrom={rulesSgSgIeFrom}
        setRulesSgSgIeFrom={setRulesSgSgIeFrom}
        rulesSgSgIeTo={rulesSgSgIeTo}
        setRulesSgSgIeTo={setRulesSgSgIeTo}
        rulesSgSgIeIcmpFrom={rulesSgSgIeIcmpFrom}
        setRulesSgSgIeIcmpFrom={setRulesSgSgIeIcmpFrom}
        rulesSgSgIeIcmpTo={rulesSgSgIeIcmpTo}
        setRulesSgSgIeIcmpTo={setRulesSgSgIeIcmpTo}
      />
      {isLoading && (
        <Styled.Loader>
          <Spin size="large" />
        </Styled.Loader>
      )}
      <SelectMainSgModal
        isOpen={isChangeMainSgModalVisible}
        handleOk={() => {
          setCenterSg(pendingSg)
          setChangeMainSgModalVisible(false)
          setPendingSg(undefined)
        }}
        handleCancel={() => setChangeMainSgModalVisible(false)}
      />
    </Styled.Container>
  )
}
