/* eslint-disable max-lines-per-function */
import React, { FC, useState, useEffect, useCallback } from 'react'
import { Result, Spin, Tabs } from 'antd'
import { MagnifyingGlass } from '@phosphor-icons/react'
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
import { setSearchText } from 'store/editor/searchText/searchText'
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
} from './utils'
import { SgSelectAndTypeSwitcher } from './organisms'
import { TransformBlock } from './populations'
import { Styled } from './styled'

export const RulesDiagram: FC = () => {
  const dispatch = useDispatch()

  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [typeId, setTypeId] = useState<string>('all')
  const [subType, setSubType] = useState<string>('TCP/UDP')

  // const [searchText, setSearchText] = useState('')

  const theme = useSelector((state: RootState) => state.theme.theme)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)
  const searchText = useSelector((state: RootState) => state.searchText.searchText)

  /* return subtype if type is changed */
  useEffect(() => {
    setSubType('TCP/UDP')
  }, [typeId])

  /* clear searchText */
  useEffect(() => {
    dispatch(setSearchText(undefined))
  }, [typeId, subType, dispatch])

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

  if (error) {
    return (
      <MiddleContainer>
        <Result status="error" title={error.status} subTitle={error.data?.message} />
      </MiddleContainer>
    )
  }

  return (
    <>
      <Layouts.HeaderRow $isDark={theme === 'dark'}>
        <TitleWithNoMargins level={3}>Diagram</TitleWithNoMargins>
      </Layouts.HeaderRow>
      <Layouts.ControlsRow $isDark={theme === 'dark'}>
        <Layouts.ControlsRightSide>
          <SgSelectAndTypeSwitcher
            isHidden={false}
            onSelectCenterSg={newSg => dispatch(setCenterSg(newSg))}
            typeId={typeId}
            subType={subType}
            onSelectSubType={setSubType}
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
                dispatch(setSearchText(e.target.value))
              }}
            />
          </Layouts.SearchControl>
        </Layouts.ControlsLeftSide>
      </Layouts.ControlsRow>
      <Styled.TabsContainer>
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: 'All Rules',
            },
            {
              key: 'sgSg',
              label: 'SG-SG',
            },
            {
              key: 'sgSgIe',
              label: 'SG-SG (I/E)',
            },
            {
              key: 'sgCidr',
              label: 'SG-CIDR (I/E)',
            },
            {
              key: 'sgFqdn',
              label: 'SG-FQDN (E)',
            },
          ]}
          onChange={key => setTypeId(key)}
        />
      </Styled.TabsContainer>
      {isLoading && (
        <MiddleContainer>
          <Spin />
        </MiddleContainer>
      )}
      {!isLoading && <TransformBlock type={typeId} subtype={subType} />}
    </>
  )
}
