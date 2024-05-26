import React, { ReactElement, ReactNode, useState } from 'react'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { FullscreenOutlined, PlusOutlined } from '@ant-design/icons'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { setSpecific } from 'store/editor/specific/specific'
import { TitleWithNoTopMargin } from 'components/atoms'
import { TTraffic } from 'localTypes/rules'
import { STATUSES } from 'constants/rules'
import { AddPopover } from '../../../../atoms'
import { Styled } from './styled'

type TRulesBlockProps<T> = {
  title: string
  popoverPosition: TooltipPlacement
  table: ReactNode
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
  openSpecificName?: string
  defaultPrioritySome?: string
  isDisabled?: boolean
  inTransformBlock?: boolean
}

export const RulesBlock = <T extends { sg?: string; prioritySome?: string | number }>({
  title,
  popoverPosition,
  table,
  rules,
  setRules,
  defaultTraffic,
  legacyOptions,
  ruleConfig,
  openSpecificName,
  defaultPrioritySome,
  isDisabled,
  inTransformBlock = true,
}: TRulesBlockProps<T>): ReactElement => {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean[]>([])
  const dispatch = useDispatch()

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: T) => {
    dispatch(
      setRules([
        ...rules,
        {
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
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  return (
    <>
      <TitleWithNoTopMargin level={4}>
        {openSpecificName && inTransformBlock && (
          <>
            <FullscreenOutlined
              onClick={() => {
                dispatch(setSpecific({ specificOpen: true, specificValue: openSpecificName }))
              }}
            />{' '}
          </>
        )}
        {title}
      </TitleWithNoTopMargin>
      {table}
      <Popover
        content={
          <AddPopover<T>
            hide={toggleAddPopover}
            addNew={addNew}
            defaultPrioritySome={defaultPrioritySome}
            {...ruleConfig}
          />
        }
        title={title}
        trigger="click"
        open={addOpen}
        onOpenChange={toggleAddPopover}
        placement={popoverPosition}
      >
        <Styled.FormItem>
          <Button type="dashed" block icon={<PlusOutlined />} disabled={isDisabled}>
            Add
          </Button>
        </Styled.FormItem>
      </Popover>
    </>
  )
}
