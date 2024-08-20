/* eslint-disable max-lines-per-function */
import React, { FC, useState } from 'react'
import { Modal, Alert } from 'antd'
import { AxiosError } from 'axios'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { TRequestErrorData, TRequestError } from 'localTypes/api'
import { upsertRules, deleteRules } from 'api/rules'
import { Spacer } from 'components'
import {
  composeAllTypesOfSgSgRules,
  composeAllTypesOfSgSgIcmpRules,
  composeAllTypesOfSgSgIeRules,
  composeAllTypesOfSgSgIeIcmpRules,
  composeAllTypesOfSgFqdnRules,
  composeAllTypesOfSgCidrRules,
  composeAllTypesOfSgCidrIcmpRules,
} from './utils/composeForSubmit'
import { RulesDiff } from './molecules'

type TChangesBlockProps = {
  centerSg: string
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export const ChangesBlock: FC<TChangesBlockProps> = ({ centerSg, isOpen, onClose, onSubmit }) => {
  const [error, setError] = useState<TRequestError | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

  const handleOk = () => {
    const sgSgRules = composeAllTypesOfSgSgRules(centerSg, rulesSgSgFrom, rulesSgSgTo)
    const sgSgIcmpRules = composeAllTypesOfSgSgIcmpRules(centerSg, rulesSgSgIcmpFrom, rulesSgSgIcmpTo)
    const sgSgIeRules = composeAllTypesOfSgSgIeRules(centerSg, rulesSgSgIeFrom, rulesSgSgIeTo)
    const sgSgIeIcmpRules = composeAllTypesOfSgSgIeIcmpRules(centerSg, rulesSgSgIeIcmpFrom, rulesSgSgIeIcmpTo)
    const sgFqdnRules = composeAllTypesOfSgFqdnRules(centerSg, rulesSgFqdnTo)
    const sgCidrRules = composeAllTypesOfSgCidrRules(centerSg, rulesSgCidrFrom, rulesSgCidrTo)
    const sgCidrIcmpRules = composeAllTypesOfSgCidrIcmpRules(centerSg, rulesSgCidrIcmpFrom, rulesSgCidrIcmpTo)

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

  return (
    <Modal
      title="Preview Changes"
      open={isOpen}
      centered
      onOk={handleOk}
      onCancel={() => {
        setIsLoading(false)
        setError(undefined)
        onClose()
      }}
      okText="Submit"
      confirmLoading={isLoading}
      width="90vw"
    >
      <Spacer $space={16} $samespace />
      {error && (
        <Alert
          message={error.status}
          description={error.data ? `Code:${error.data.code}. Message: ${error.data.message}` : undefined}
          type="error"
          showIcon
          closable
        />
      )}
      <RulesDiff title="SG-SG" type="sgSg" />
      <RulesDiff title="SG-SG ICMP" type="sgSgIcmp" />
      <RulesDiff title="SG-SG (I/E)" type="sgSgIe" />
      <RulesDiff title="SG-SG (I/E) ICMP" type="sgSsgSgIeIcmpgIe" />
      <RulesDiff title="SG-CIDR (I/E)" type="sgCidr" />
      <RulesDiff title="SG-CIDR (I/E) ICMP" type="sgCidrIcmp" />
      <RulesDiff title="SG-FQDN (E)" type="sgFqdn" />
    </Modal>
  )
}
