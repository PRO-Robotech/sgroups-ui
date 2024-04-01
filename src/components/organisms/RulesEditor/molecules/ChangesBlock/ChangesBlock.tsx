/* eslint-disable max-lines-per-function */
import React, { FC, Dispatch, SetStateAction, useState } from 'react'
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
    const sgRules = composeAllTypesOfSgRules(centerSg, rulesSgFrom, rulesSgTo)
    const fqdnRules = composeAllTypesOfFqdnRules(centerSg, rulesFqdnTo)
    const cidrRules = composeAllTypesOfCidrSgRules(centerSg, rulesCidrSgFrom, rulesCidrSgTo)
    const sgSgIcmpRules = composeAllTypesOfSgSgIcmpRules(centerSg, rulesSgSgIcmpFrom, rulesSgSgIcmpTo)
    const sgSgIeRules = composeAllTypesOfSgSgIeRules(centerSg, rulesSgSgIeFrom, rulesSgSgIeTo)
    const sgSgIeIcmpRules = composeAllTypesOfSgSgIeIcmpRules(centerSg, rulesSgSgIeIcmpFrom, rulesSgSgIeIcmpTo)

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
        <Button type="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleOk}>
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
