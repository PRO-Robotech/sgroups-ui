/* eslint-disable max-lines-per-function */
import React, { FC, useEffect, Dispatch, SetStateAction, useState } from 'react'
import { AxiosError } from 'axios'
import { Button, Result, Spin } from 'antd'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { Spacer, TitleWithNoTopMargin } from 'components'
import {
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
} from 'localTypes/rules'
import { upsertRules, deleteRules } from 'api/rules'
import {
  getChangesSgRules,
  getChangesFqdnRules,
  getChangesCidrSgRules,
  getChangesSgSgIcmpRules,
  getChangesSgSgIeRules,
  getChangesSgSgIeIcmpRules,
  composeAllTypesOfSgRules,
  composeAllTypesOfFqdnRules,
  composeAllTypesOfCidrSgRules,
  composeAllTypesOfSgSgIcmpRules,
  composeAllTypesOfSgSgIeRules,
  composeAllTypesOfSgSgIeIcmpRules,
  checkIfSomeChangesMarked,
} from './utils'
import { RulesDiff } from './molecules'
import { Styled } from './styled'

type TChangesBlockProps = {
  centerSg: string
  sgNames: string[]
  rulesSgFrom: TFormSgRule[]
  setRulesSgFrom: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesSgTo: TFormSgRule[]
  setRulesSgTo: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesFqdnTo: TFormFqdnRule[]
  setRulesFqdnTo: Dispatch<SetStateAction<TFormFqdnRule[]>>
  rulesCidrSgFrom: TFormCidrSgRule[]
  setRulesCidrSgFrom: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesCidrSgTo: TFormCidrSgRule[]
  setRulesCidrSgTo: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[]
  setRulesSgSgIcmpFrom: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[]
  setRulesSgSgIcmpTo: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesSgSgIeFrom: TFormSgSgIeRule[]
  setRulesSgSgIeFrom: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  rulesSgSgIeTo: TFormSgSgIeRule[]
  setRulesSgSgIeTo: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[]
  setRulesSgSgIeIcmpFrom: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[]
  setRulesSgSgIeIcmpTo: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
  onClose: () => void
  onSubmit: () => void
}

export const ChangesBlock: FC<TChangesBlockProps> = ({
  centerSg,
  sgNames,
  rulesSgFrom,
  setRulesSgFrom,
  rulesSgTo,
  setRulesSgTo,
  rulesFqdnTo,
  setRulesFqdnTo,
  rulesCidrSgFrom,
  setRulesCidrSgFrom,
  rulesCidrSgTo,
  setRulesCidrSgTo,
  rulesSgSgIcmpFrom,
  setRulesSgSgIcmpFrom,
  rulesSgSgIcmpTo,
  setRulesSgSgIcmpTo,
  rulesSgSgIeFrom,
  setRulesSgSgIeFrom,
  rulesSgSgIeTo,
  setRulesSgSgIeTo,
  rulesSgSgIeIcmpFrom,
  setRulesSgSgIeIcmpFrom,
  rulesSgSgIeIcmpTo,
  setRulesSgSgIeIcmpTo,
  onClose,
  onSubmit,
}) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)

  useEffect(() => {
    const isSomeChangesMarked = checkIfSomeChangesMarked(
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
    if (isSomeChangesMarked) {
      setIsSubmitDisabled(false)
    } else {
      setIsSubmitDisabled(true)
    }
  }, [
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
  ])

  const changesResultSgFromResult = getChangesSgRules(rulesSgFrom)
  const changesResultSgToResult = getChangesSgRules(rulesSgTo)
  const changesResultFqdnTo = getChangesFqdnRules(rulesFqdnTo)
  const changesResultCidrSgFrom = getChangesCidrSgRules(rulesCidrSgFrom)
  const changesResultCidrSgTo = getChangesCidrSgRules(rulesCidrSgTo)
  const changesResultSgSgIcmpFrom = getChangesSgSgIcmpRules(rulesSgSgIcmpFrom)
  const changesResultSgSgIcmpTo = getChangesSgSgIcmpRules(rulesSgSgIcmpTo)
  const changesResultSgSgIeFrom = getChangesSgSgIeRules(rulesSgSgIeFrom)
  const changesResultSgSgIeTo = getChangesSgSgIeRules(rulesSgSgIeTo)
  const changesResultSgSgIeIcmpFrom = getChangesSgSgIeIcmpRules(rulesSgSgIeIcmpFrom)
  const changesResultSgSgIeIcmpTo = getChangesSgSgIeIcmpRules(rulesSgSgIeIcmpTo)

  const handleOk = () => {
    const sgRules = composeAllTypesOfSgRules(
      centerSg,
      rulesSgFrom.filter(({ checked }) => checked),
      rulesSgTo.filter(({ checked }) => checked),
    )
    const fqdnRules = composeAllTypesOfFqdnRules(
      centerSg,
      rulesFqdnTo.filter(({ checked }) => checked),
    )
    const cidrRules = composeAllTypesOfCidrSgRules(
      centerSg,
      rulesCidrSgFrom.filter(({ checked }) => checked),
      rulesCidrSgTo.filter(({ checked }) => checked),
    )
    const sgSgIcmpRules = composeAllTypesOfSgSgIcmpRules(
      centerSg,
      rulesSgSgIcmpFrom.filter(({ checked }) => checked),
      rulesSgSgIcmpTo.filter(({ checked }) => checked),
    )
    const sgSgIeRules = composeAllTypesOfSgSgIeRules(
      centerSg,
      rulesSgSgIeFrom.filter(({ checked }) => checked),
      rulesSgSgIeTo.filter(({ checked }) => checked),
    )
    const sgSgIeIcmpRules = composeAllTypesOfSgSgIeIcmpRules(
      centerSg,
      rulesSgSgIeIcmpFrom.filter(({ checked }) => checked),
      rulesSgSgIeIcmpTo.filter(({ checked }) => checked),
    )

    deleteRules(
      sgRules.rulesToDelete,
      fqdnRules.rulesToDelete,
      cidrRules.rulesToDelete,
      sgSgIcmpRules.rulesToDelete,
      sgSgIeRules.rulesToDelete,
      sgSgIeIcmpRules.rulesToDelete,
    )
      .then(() => {
        // Do not touch: Seuquence is important. Promise.All wont work properly
        upsertRules(
          sgRules.rules,
          fqdnRules.rules,
          cidrRules.rules,
          sgSgIcmpRules.rules,
          sgSgIeRules.rules,
          sgSgIeIcmpRules.rules,
        )
          .then(() => {
            setIsLoading(false)
            onSubmit()
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

  const handleClose = () => {
    const uncheckedRulesSgFrom = [...rulesSgFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgTo = [...rulesSgTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesFqdnTo = [...rulesFqdnTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesCidrSgFrom = [...rulesCidrSgFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesCidrSgTo = [...rulesCidrSgTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIcmpFrom = [...rulesSgSgIcmpFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIcmpTo = [...rulesSgSgIcmpTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeFrom = [...rulesSgSgIeFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeTo = [...rulesSgSgIeTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeIcmpFrom = [...rulesSgSgIeIcmpFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeIcmpTo = [...rulesSgSgIeIcmpTo].map(el => ({ ...el, checked: false }))
    setRulesSgFrom(uncheckedRulesSgFrom)
    setRulesSgTo(uncheckedRulesSgTo)
    setRulesFqdnTo(uncheckedRulesFqdnTo)
    setRulesCidrSgFrom(uncheckedRulesCidrSgFrom)
    setRulesCidrSgTo(uncheckedRulesCidrSgTo)
    setRulesSgSgIcmpFrom(uncheckedRulesSgSgIcmpFrom)
    setRulesSgSgIcmpTo(uncheckedRulesSgSgIcmpTo)
    setRulesSgSgIeFrom(uncheckedRulesSgSgIeFrom)
    setRulesSgSgIeTo(uncheckedRulesSgSgIeTo)
    setRulesSgSgIeIcmpFrom(uncheckedRulesSgSgIeIcmpFrom)
    setRulesSgSgIeIcmpTo(uncheckedRulesSgSgIeIcmpTo)
    onClose()
  }

  return (
    <>
      <TitleWithNoTopMargin level={3}>Changes for: {centerSg}</TitleWithNoTopMargin>
      <Styled.ScrollContainer>
        {changesResultSgFromResult && (
          <RulesDiff
            title="SG From"
            compareResult={{
              type: 'sg',
              data: changesResultSgFromResult,
              sgNames,
              rules: rulesSgFrom,
              setRules: setRulesSgFrom,
              rulesOtherside: rulesSgTo,
              setRulesOtherside: setRulesSgTo,
              popoverPosition: 'right',
              centerSg,
            }}
          />
        )}
        {changesResultSgToResult && (
          <RulesDiff
            title="SG To"
            compareResult={{
              type: 'sg',
              data: changesResultSgToResult,
              sgNames,
              rules: rulesSgTo,
              setRules: setRulesSgTo,
              rulesOtherside: rulesSgFrom,
              setRulesOtherside: setRulesSgFrom,
              popoverPosition: 'right',
              centerSg,
            }}
          />
        )}
        {changesResultFqdnTo && (
          <RulesDiff
            title="FQDN To"
            compareResult={{
              type: 'fqdn',
              data: changesResultFqdnTo,
              rules: rulesFqdnTo,
              setRules: setRulesFqdnTo,
              popoverPosition: 'left',
            }}
          />
        )}
        {changesResultCidrSgFrom && (
          <RulesDiff
            title="CIDR-SG From"
            compareResult={{
              type: 'cidr',
              data: changesResultCidrSgFrom,
              defaultTraffic: 'Ingress',
              rules: rulesCidrSgFrom,
              setRules: setRulesCidrSgFrom,
              popoverPosition: 'left',
            }}
          />
        )}
        {changesResultCidrSgTo && (
          <RulesDiff
            title="CIDR-SG To"
            compareResult={{
              type: 'cidr',
              data: changesResultCidrSgTo,
              defaultTraffic: 'Egress',
              rules: rulesCidrSgTo,
              setRules: setRulesCidrSgTo,
              popoverPosition: 'left',
            }}
          />
        )}
        {changesResultSgSgIcmpFrom && (
          <RulesDiff
            title="SG-SG-ICMP From"
            compareResult={{
              type: 'sgSgIcmp',
              data: changesResultSgSgIcmpFrom,
              sgNames,
              popoverPosition: 'left',
              rules: rulesSgSgIcmpFrom,
              setRules: setRulesSgSgIcmpFrom,
              rulesOtherside: rulesSgSgIcmpTo,
              setRulesOtherside: setRulesSgSgIcmpTo,
              centerSg,
            }}
          />
        )}
        {changesResultSgSgIcmpTo && (
          <RulesDiff
            title="SG-SG-ICMP To"
            compareResult={{
              type: 'sgSgIcmp',
              data: changesResultSgSgIcmpTo,
              sgNames,
              popoverPosition: 'left',
              rules: rulesSgSgIcmpTo,
              setRules: setRulesSgSgIcmpTo,
              rulesOtherside: rulesSgSgIcmpFrom,
              setRulesOtherside: setRulesSgSgIcmpFrom,
              centerSg,
            }}
          />
        )}
        {changesResultSgSgIeFrom && (
          <RulesDiff
            title="SG-SG-IE From"
            compareResult={{
              type: 'sgSgIe',
              data: changesResultSgSgIeFrom,
              sgNames,
              popoverPosition: 'left',
              defaultTraffic: 'Ingress',
              rules: rulesSgSgIeFrom,
              setRules: setRulesSgSgIeFrom,
            }}
          />
        )}
        {changesResultSgSgIeTo && (
          <RulesDiff
            title="SG-SG-IE To"
            compareResult={{
              type: 'sgSgIe',
              data: changesResultSgSgIeTo,
              sgNames,
              popoverPosition: 'left',
              defaultTraffic: 'Egress',
              rules: rulesSgSgIeTo,
              setRules: setRulesSgSgIeTo,
            }}
          />
        )}
        {changesResultSgSgIeIcmpFrom && (
          <RulesDiff
            title="SG-SG-IE-ICMP From"
            compareResult={{
              type: 'sgSgIeIcmp',
              data: changesResultSgSgIeIcmpFrom,
              sgNames,
              popoverPosition: 'left',
              defaultTraffic: 'Ingress',
              rules: rulesSgSgIeIcmpFrom,
              setRules: setRulesSgSgIeIcmpFrom,
            }}
          />
        )}
        {changesResultSgSgIeIcmpTo && (
          <RulesDiff
            title="SG-SG-IE-ICMP To"
            compareResult={{
              type: 'sgSgIeIcmp',
              data: changesResultSgSgIeIcmpTo,
              sgNames,
              popoverPosition: 'left',
              defaultTraffic: 'Egress',
              rules: rulesSgSgIeIcmpTo,
              setRules: setRulesSgSgIeIcmpTo,
            }}
          />
        )}
        {!changesResultSgFromResult &&
          !changesResultSgToResult &&
          !changesResultFqdnTo &&
          !changesResultCidrSgFrom &&
          !changesResultCidrSgTo &&
          !changesResultSgSgIcmpFrom &&
          !changesResultSgSgIcmpTo &&
          !changesResultSgSgIeFrom &&
          !changesResultSgSgIeTo &&
          !changesResultSgSgIeIcmpFrom &&
          !changesResultSgSgIeIcmpTo && <div>No changes</div>}
      </Styled.ScrollContainer>
      <Spacer />
      <Styled.ButtonsContainer>
        <Button type="default" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleOk} disabled={isSubmitDisabled}>
          Submit
        </Button>
      </Styled.ButtonsContainer>
      {isLoading && <Spin />}
      {error && (
        <Result
          status="error"
          title={error.status}
          subTitle={`Code:${error.data?.code}. Message: ${error.data?.message}`}
        />
      )}
    </>
  )
}
