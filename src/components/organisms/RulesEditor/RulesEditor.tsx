import React, { FC, useState, useEffect } from 'react'
import { AxiosError } from 'axios'
import { Result, Spin } from 'antd'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { TFormSgRule, TFormFqdnRule, TFormCidrSgRule, TFormSgSgIcmpRule } from 'localTypes/rules'
import { getSecurityGroups } from 'api/securityGroups'
import {
  getRulesBySGFrom,
  getRulesBySGTo,
  getFqdnRulesBySGFrom,
  getCidrSgRulesBySG,
  getSgSgIcmpRulesBySgFrom,
  getSgSgIcmpRulesBySgTo,
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
} from './utils'
import { Styled } from './styled'

export const RulesEditor: FC = () => {
  const [sgNames, setSgNames] = useState<string[]>([])
  const [centerSg, setCenterSg] = useState<string>()
  const [rulesSgFrom, setRulesSgFrom] = useState<TFormSgRule[]>([])
  const [rulesSgTo, setRulesSgTo] = useState<TFormSgRule[]>([])
  const [rulesFqdnTo, setRulesFqdnTo] = useState<TFormFqdnRule[]>([])
  const [rulesCidrSgFrom, setRulesCidrSgFrom] = useState<TFormCidrSgRule[]>([])
  const [rulesCidrSgTo, setRulesCidrSgTo] = useState<TFormCidrSgRule[]>([])
  const [rulesSgSgIcmpFrom, setRulesSgSgIcmpFrom] = useState<TFormSgSgIcmpRule[]>([])
  const [rulesSgSgIcmpTo, setRulesSgSgIcmpTo] = useState<TFormSgSgIcmpRule[]>([])
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
      setRulesSgFrom([])
      setRulesSgTo([])
      setRulesFqdnTo([])
      setRulesCidrSgFrom([])
      setRulesCidrSgTo([])
      setRulesSgSgIcmpFrom([])
      setRulesSgSgIcmpTo([])
      setError(undefined)
      Promise.all([
        getRulesBySGTo(centerSg),
        getRulesBySGFrom(centerSg),
        getFqdnRulesBySGFrom(centerSg),
        getCidrSgRulesBySG(centerSg),
        getSgSgIcmpRulesBySgTo(centerSg),
        getSgSgIcmpRulesBySgFrom(centerSg),
      ])
        .then(([rulesSgFrom, rulesSgTo, rulesFqdnTo, rulesCidrSg, rulesSgSgIcmpFrom, rulesSgSgIcmpTo]) => {
          setRulesSgFrom(mapRulesSgFrom(rulesSgFrom.data.rules))
          setRulesSgTo(mapRulesSgTo(rulesSgTo.data.rules))
          setRulesFqdnTo(mapRulesFqdnTo(rulesFqdnTo.data.rules))
          setRulesCidrSgFrom(mapRulesCidrSgFrom(rulesCidrSg.data.rules))
          setRulesCidrSgTo(mapRulesCidrSgTo(rulesCidrSg.data.rules))
          setRulesSgSgIcmpFrom(mapRulesSgSgIcmpFrom(rulesSgSgIcmpFrom.data.rules))
          setRulesSgSgIcmpTo(mapRulesSgSgIcmpTo(rulesSgSgIcmpTo.data.rules))
        })
        .catch((error: AxiosError<TRequestErrorData>) => {
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
      setError(undefined)
    }
  }

  useEffect(() => {
    fetchData(centerSg)
  }, [centerSg])

  if (error) {
    return (
      <Result
        status="error"
        title={error.status}
        subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
      />
    )
  }

  if (isLoading) {
    return <Spin />
  }

  return (
    <Styled.Container>
      <TransformBlock
        sgNames={sgNames}
        centerSg={centerSg}
        setCenterSg={setCenterSg}
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
      />
      <BottomBar
        centerSg={centerSg}
        onSubmit={() => fetchData(centerSg)}
        rulesSgFrom={rulesSgFrom}
        rulesSgTo={rulesSgTo}
        rulesFqdnTo={rulesFqdnTo}
        rulesCidrSgTo={rulesCidrSgTo}
        rulesCidrSgFrom={rulesCidrSgFrom}
        rulesSgSgIcmpFrom={rulesSgSgIcmpFrom}
        rulesSgSgIcmpTo={rulesSgSgIcmpTo}
      />
    </Styled.Container>
  )
}
