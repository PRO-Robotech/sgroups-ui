import React, { FC, useState } from 'react'
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
  rulesSgFrom: TFormSgRule[]
  rulesSgTo: TFormSgRule[]
  rulesFqdnTo: TFormFqdnRule[]
  rulesCidrSgFrom: TFormCidrSgRule[]
  rulesCidrSgTo: TFormCidrSgRule[]
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[]
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[]
  rulesSgSgIeFrom: TFormSgSgIeRule[]
  rulesSgSgIeTo: TFormSgSgIeRule[]
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[]
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[]
  onClose: () => void
  onSubmit: () => void
}

export const ChangesBlock: FC<TChangesBlockProps> = ({
  centerSg,
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
          <RulesDiff title="SG From" compareResult={{ type: 'sg', data: changesResultSgFromResult }} />
        )}
        {changesResultSgToResult && (
          <RulesDiff title="SG To" compareResult={{ type: 'sg', data: changesResultSgToResult }} />
        )}
        {changesResultFqdnTo && (
          <RulesDiff title="FQDN To" compareResult={{ type: 'fqdn', data: changesResultFqdnTo }} />
        )}
        {changesResultCidrSgFrom && (
          <RulesDiff title="CIDR-SG From" compareResult={{ type: 'cidr', data: changesResultCidrSgFrom }} />
        )}
        {changesResultCidrSgTo && (
          <RulesDiff title="CIDR-SG To" compareResult={{ type: 'cidr', data: changesResultCidrSgTo }} />
        )}
        {changesResultSgSgIcmpFrom && (
          <RulesDiff title="SG-SG-ICMP From" compareResult={{ type: 'sgSgIcmp', data: changesResultSgSgIcmpFrom }} />
        )}
        {changesResultSgSgIcmpTo && (
          <RulesDiff title="SG-SG-ICMP To" compareResult={{ type: 'sgSgIcmp', data: changesResultSgSgIcmpTo }} />
        )}
        {changesResultSgSgIeFrom && (
          <RulesDiff title="SG-SG-IE From" compareResult={{ type: 'sgSgIe', data: changesResultSgSgIeFrom }} />
        )}
        {changesResultSgSgIeTo && (
          <RulesDiff title="SG-SG-IE To" compareResult={{ type: 'sgSgIe', data: changesResultSgSgIeTo }} />
        )}
        {changesResultSgSgIeIcmpFrom && (
          <RulesDiff
            title="SG-SG-IE-ICMP From"
            compareResult={{ type: 'sgSgIeIcmp', data: changesResultSgSgIeIcmpFrom }}
          />
        )}
        {changesResultSgSgIeIcmpTo && (
          <RulesDiff title="SG-SG-IE-ICMP To" compareResult={{ type: 'sgSgIeIcmp', data: changesResultSgSgIeIcmpTo }} />
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
