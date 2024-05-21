/* eslint-disable max-lines-per-function */
import React, { FC, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { Button, Result, Spin } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { setRulesSgSgFrom, setRulesSgSgTo } from 'store/editor/rulesSgSg/rulesSgSg'
import { setRulesSgSgIcmpFrom, setRulesSgSgIcmpTo } from 'store/editor/rulesSgSgIcmp/rulesSgSgIcmp'
import { setRulesSgSgIeFrom, setRulesSgSgIeTo } from 'store/editor/rulesSgSgIe/rulesSgSgIe'
import { setRulesSgSgIeIcmpFrom, setRulesSgSgIeIcmpTo } from 'store/editor/rulesSgSgIeIcmp/rulesSgSgIeIcmp'
import { setRulesSgFqdnTo } from 'store/editor/rulesSgFqdn/rulesSgFqdn'
import { setRulesSgCidrFrom, setRulesSgCidrTo } from 'store/editor/rulesSgCidr/rulesSgCidr'
import { setRulesSgCidrIcmpFrom, setRulesSgCidrIcmpTo } from 'store/editor/rulesSgCidrIcmp/rulesSgCidrIcmp'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { Spacer, TitleWithNoTopMargin } from 'components'
import { upsertRules, deleteRules } from 'api/rules'
import {
  getChangesSgSgRules,
  getChangesSgSgIcmpRules,
  getChangesSgSgIeRules,
  getChangesSgSgIeIcmpRules,
  getChangesSgFqdnRules,
  getChangesSgCidrIcmpRules,
  getChangesSgCidrRules,
  composeAllTypesOfSgSgRules,
  composeAllTypesOfSgSgIcmpRules,
  composeAllTypesOfSgSgIeRules,
  composeAllTypesOfSgSgIeIcmpRules,
  composeAllTypesOfSgFqdnRules,
  composeAllTypesOfSgCidrRules,
  composeAllTypesOfSgCidrIcmpRules,
  checkIfSomeChangesMarked,
} from './utils'
import { RulesDiff } from './molecules'
import { Styled } from './styled'

type TChangesBlockProps = {
  centerSg: string
  onClose: () => void
  onSubmit: () => void
}

export const ChangesBlock: FC<TChangesBlockProps> = ({ centerSg, onClose, onSubmit }) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)

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
    const isSomeChangesMarked = checkIfSomeChangesMarked({
      rulesSgSgFrom,
      rulesSgSgTo,
      rulesSgFqdnTo,
      rulesSgCidrFrom,
      rulesSgCidrTo,
      rulesSgSgIcmpFrom,
      rulesSgSgIcmpTo,
      rulesSgSgIeFrom,
      rulesSgSgIeTo,
      rulesSgSgIeIcmpFrom,
      rulesSgSgIeIcmpTo,
      rulesSgCidrIcmpFrom,
      rulesSgCidrIcmpTo,
    })
    if (isSomeChangesMarked) {
      setIsSubmitDisabled(false)
    } else {
      setIsSubmitDisabled(true)
    }
  }, [
    rulesSgSgFrom,
    rulesSgSgTo,
    rulesSgFqdnTo,
    rulesSgCidrFrom,
    rulesSgCidrTo,
    rulesSgSgIcmpFrom,
    rulesSgSgIcmpTo,
    rulesSgSgIeFrom,
    rulesSgSgIeTo,
    rulesSgSgIeIcmpFrom,
    rulesSgSgIeIcmpTo,
    rulesSgCidrIcmpFrom,
    rulesSgCidrIcmpTo,
  ])

  const changesResultSgSgFromResult = getChangesSgSgRules(rulesSgSgFrom)
  const changesResultSgSgToResult = getChangesSgSgRules(rulesSgSgTo)
  const changesResultSgSgIcmpFrom = getChangesSgSgIcmpRules(rulesSgSgIcmpFrom)
  const changesResultSgSgIcmpTo = getChangesSgSgIcmpRules(rulesSgSgIcmpTo)
  const changesResultSgSgIeFrom = getChangesSgSgIeRules(rulesSgSgIeFrom)
  const changesResultSgSgIeTo = getChangesSgSgIeRules(rulesSgSgIeTo)
  const changesResultSgSgIeIcmpFrom = getChangesSgSgIeIcmpRules(rulesSgSgIeIcmpFrom)
  const changesResultSgSgIeIcmpTo = getChangesSgSgIeIcmpRules(rulesSgSgIeIcmpTo)
  const changesResultSgFqdnTo = getChangesSgFqdnRules(rulesSgFqdnTo)
  const changesResultSgCidrFrom = getChangesSgCidrRules(rulesSgCidrFrom)
  const changesResultSgCidrTo = getChangesSgCidrRules(rulesSgCidrTo)
  const changesResultSgCidrIcmpFrom = getChangesSgCidrIcmpRules(rulesSgCidrIcmpFrom)
  const changesResultSgCidrIcmpTo = getChangesSgCidrIcmpRules(rulesSgCidrIcmpTo)

  const handleOk = () => {
    const sgSgRules = composeAllTypesOfSgSgRules(
      centerSg,
      rulesSgSgFrom.filter(({ checked }) => checked),
      rulesSgSgTo.filter(({ checked }) => checked),
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
    const sgFqdnRules = composeAllTypesOfSgFqdnRules(
      centerSg,
      rulesSgFqdnTo.filter(({ checked }) => checked),
    )
    const sgCidrRules = composeAllTypesOfSgCidrRules(
      centerSg,
      rulesSgCidrFrom.filter(({ checked }) => checked),
      rulesSgCidrTo.filter(({ checked }) => checked),
    )
    const sgCidrIcmpRules = composeAllTypesOfSgCidrIcmpRules(
      centerSg,
      rulesSgCidrIcmpFrom.filter(({ checked }) => checked),
      rulesSgCidrIcmpTo.filter(({ checked }) => checked),
    )

    deleteRules(
      sgSgRules.rulesToDelete,
      sgSgIcmpRules.rulesToDelete,
      sgSgIeRules.rulesToDelete,
      sgSgIeIcmpRules.rulesToDelete,
      sgFqdnRules.rulesToDelete,
      sgCidrRules.rulesToDelete,
      sgCidrIcmpRules.rulesToDelete,
    )
      .then(() => {
        // Do not touch: Seuquence is important. Promise.All wont work properly
        upsertRules(
          sgSgRules.rules,
          sgSgIcmpRules.rules,
          sgSgIeRules.rules,
          sgSgIeIcmpRules.rules,
          sgFqdnRules.rules,
          sgCidrRules.rules,
          sgCidrIcmpRules.rules,
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
    const uncheckedRulesSgSgFrom = [...rulesSgSgFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgTo = [...rulesSgSgTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIcmpFrom = [...rulesSgSgIcmpFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIcmpTo = [...rulesSgSgIcmpTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeFrom = [...rulesSgSgIeFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeTo = [...rulesSgSgIeTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeIcmpFrom = [...rulesSgSgIeIcmpFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgSgIeIcmpTo = [...rulesSgSgIeIcmpTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgFqdnTo = [...rulesSgFqdnTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgCidrFrom = [...rulesSgCidrFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgCidrTo = [...rulesSgCidrTo].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgCidrIcmpFrom = [...rulesSgCidrIcmpFrom].map(el => ({ ...el, checked: false }))
    const uncheckedRulesSgCidrIcmpTo = [...rulesSgCidrIcmpTo].map(el => ({ ...el, checked: false }))
    setRulesSgSgFrom(uncheckedRulesSgSgFrom)
    setRulesSgSgTo(uncheckedRulesSgSgTo)
    setRulesSgSgIcmpFrom(uncheckedRulesSgSgIcmpFrom)
    setRulesSgSgIcmpTo(uncheckedRulesSgSgIcmpTo)
    setRulesSgSgIeFrom(uncheckedRulesSgSgIeFrom)
    setRulesSgSgIeTo(uncheckedRulesSgSgIeTo)
    setRulesSgSgIeIcmpFrom(uncheckedRulesSgSgIeIcmpFrom)
    setRulesSgSgIeIcmpTo(uncheckedRulesSgSgIeIcmpTo)
    setRulesSgFqdnTo(uncheckedRulesSgFqdnTo)
    setRulesSgCidrFrom(uncheckedRulesSgCidrFrom)
    setRulesSgCidrTo(uncheckedRulesSgCidrTo)
    setRulesSgCidrIcmpFrom(uncheckedRulesSgCidrIcmpFrom)
    setRulesSgCidrIcmpTo(uncheckedRulesSgCidrIcmpTo)
    onClose()
  }

  return (
    <>
      <TitleWithNoTopMargin level={3}>Changes for: {centerSg}</TitleWithNoTopMargin>
      <Styled.ScrollContainer>
        {changesResultSgSgFromResult && (
          <RulesDiff
            title="SG From"
            compareResult={{
              type: 'sgSg',
              data: changesResultSgSgFromResult,
              rules: rulesSgSgFrom,
              setRules: setRulesSgSgFrom,
              rulesOtherside: rulesSgSgTo,
              setRulesOtherside: setRulesSgSgTo,
              popoverPosition: 'right',
              centerSg,
            }}
          />
        )}
        {changesResultSgSgToResult && (
          <RulesDiff
            title="SG To"
            compareResult={{
              type: 'sgSg',
              data: changesResultSgSgToResult,
              rules: rulesSgSgTo,
              setRules: setRulesSgSgTo,
              rulesOtherside: rulesSgSgFrom,
              setRulesOtherside: setRulesSgSgFrom,
              popoverPosition: 'right',
              centerSg,
            }}
          />
        )}
        {changesResultSgSgIcmpFrom && (
          <RulesDiff
            title="SG-SG-ICMP From"
            compareResult={{
              type: 'sgSgIcmp',
              data: changesResultSgSgIcmpFrom,
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
              popoverPosition: 'left',
              defaultTraffic: 'Egress',
              rules: rulesSgSgIeIcmpTo,
              setRules: setRulesSgSgIeIcmpTo,
            }}
          />
        )}
        {changesResultSgFqdnTo && (
          <RulesDiff
            title="FQDN To"
            compareResult={{
              type: 'sgFqdn',
              data: changesResultSgFqdnTo,
              rules: rulesSgFqdnTo,
              setRules: setRulesSgFqdnTo,
              popoverPosition: 'left',
            }}
          />
        )}
        {changesResultSgCidrFrom && (
          <RulesDiff
            title="CIDR-SG From"
            compareResult={{
              type: 'sgCidr',
              data: changesResultSgCidrFrom,
              defaultTraffic: 'Ingress',
              rules: rulesSgCidrFrom,
              setRules: setRulesSgCidrFrom,
              popoverPosition: 'left',
            }}
          />
        )}
        {changesResultSgCidrTo && (
          <RulesDiff
            title="CIDR-SG To"
            compareResult={{
              type: 'sgCidr',
              data: changesResultSgCidrTo,
              defaultTraffic: 'Egress',
              rules: rulesSgCidrTo,
              setRules: setRulesSgCidrTo,
              popoverPosition: 'left',
            }}
          />
        )}
        {changesResultSgCidrIcmpFrom && (
          <RulesDiff
            title="CIDR-ICMP From"
            compareResult={{
              type: 'sgCidrIcmp',
              data: changesResultSgCidrIcmpFrom,
              popoverPosition: 'left',
              defaultTraffic: 'Ingress',
              rules: rulesSgCidrIcmpFrom,
              setRules: setRulesSgCidrIcmpFrom,
            }}
          />
        )}
        {changesResultSgCidrIcmpTo && (
          <RulesDiff
            title="CIDR-ICMP To"
            compareResult={{
              type: 'sgCidrIcmp',
              data: changesResultSgCidrIcmpTo,
              popoverPosition: 'left',
              defaultTraffic: 'Egress',
              rules: rulesSgCidrIcmpTo,
              setRules: setRulesSgCidrIcmpTo,
            }}
          />
        )}
        {!changesResultSgSgFromResult &&
          !changesResultSgSgToResult &&
          !changesResultSgSgIcmpFrom &&
          !changesResultSgSgIcmpTo &&
          !changesResultSgSgIeFrom &&
          !changesResultSgSgIeTo &&
          !changesResultSgSgIeIcmpFrom &&
          !changesResultSgSgIeIcmpTo &&
          !changesResultSgFqdnTo &&
          !changesResultSgCidrFrom &&
          !changesResultSgCidrTo &&
          !changesResultSgCidrIcmpFrom &&
          !changesResultSgCidrIcmpTo && <div>No changes</div>}
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
