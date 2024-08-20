import React, { ReactElement, ReactNode, useState } from 'react'
import { nanoid } from 'nanoid'
import { Plus, CaretUp, CaretDown } from '@phosphor-icons/react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { TitleWithNoMargins, FlexButton, Spacer } from 'components/atoms'
import { TTraffic } from 'localTypes/rules'
import { STATUSES } from 'constants/rules'
import { AddModal } from '../../../../atoms'
import { Styled } from './styled'

type TRulesBlockProps<T> = {
  title: string
  table: ReactNode
  direction: 'Ingress' | 'Egress'
  ruleConfig: {
    isSg?: boolean
    isFqdn?: boolean
    isCidr?: boolean
    isPorts?: boolean
    isTransport?: boolean
    isIcmp?: boolean
    isTrace?: boolean
  }
  rules: T[]
  setRules: ActionCreatorWithPayload<T[]>
  legacyOptions?: {
    centerSg?: string
    rulesOtherside: T[]
    setRulesOtherside: ActionCreatorWithPayload<T[]>
  }
  defaultTraffic?: TTraffic
  defaultPrioritySome?: string
  isDisabled?: boolean
}

export const RulesBlock = <T extends { sg?: string; prioritySome?: string | number }>({
  table,
  direction,
  rules,
  setRules,
  defaultTraffic,
  legacyOptions,
  ruleConfig,
  defaultPrioritySome,
  isDisabled,
}: TRulesBlockProps<T>): ReactElement => {
  const [addOpen, setAddOpen] = useState(false)
  const [isCollapsedOpen, setCollapsedOpen] = useState(false)
  const dispatch = useDispatch()

  const addNew = (values: T) => {
    dispatch(
      setRules([
        ...rules,
        {
          id: nanoid(),
          ...values,
          traffic: defaultTraffic || null,
          initialValues: { ...values, formChanges: null, id: null },
          prioritySome:
            values.prioritySome && typeof values.prioritySome === 'string' && values.prioritySome.length > 0
              ? Number(values.prioritySome)
              : undefined,
          formChanges: {
            status: STATUSES.new,
          },
        },
      ]),
    )
    /* remove as legacy after only ie-sg-sg will remain */
    if (legacyOptions) {
      if (values.sg === legacyOptions.centerSg) {
        dispatch(
          legacyOptions.setRulesOtherside([
            ...legacyOptions.rulesOtherside,
            {
              ...values,
              initialValues: { ...values, formChanges: null, id: null },
              formChanges: {
                status: STATUSES.new,
              },
            },
          ]),
        )
      }
    }
    /* end of remove block */
  }

  return (
    <Styled.CustomCard>
      <Styled.HeaderAndControls>
        <Styled.LeftPart
          onClick={() => {
            if (rules.length > 0) {
              setCollapsedOpen(!isCollapsedOpen)
            }
          }}
          $isCursorPointer={rules?.length > 0}
        >
          <TitleWithNoMargins level={5}>{direction === 'Ingress' ? 'Ingress' : 'Egress'}</TitleWithNoMargins>
          {rules?.length > 0 && (
            <Styled.Carets>{isCollapsedOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}</Styled.Carets>
          )}
        </Styled.LeftPart>
        <div>
          <FlexButton type="primary" icon={<Plus size={20} />} disabled={isDisabled} onClick={() => setAddOpen(true)}>
            Add
          </FlexButton>
        </div>
      </Styled.HeaderAndControls>
      {isCollapsedOpen && (
        <>
          <Spacer $space={20} $samespace />
          {table}
        </>
      )}
      <AddModal<T>
        open={addOpen}
        direction={direction}
        hide={() => setAddOpen(false)}
        addNew={addNew}
        defaultPrioritySome={defaultPrioritySome}
        {...ruleConfig}
      />
    </Styled.CustomCard>
  )
}
