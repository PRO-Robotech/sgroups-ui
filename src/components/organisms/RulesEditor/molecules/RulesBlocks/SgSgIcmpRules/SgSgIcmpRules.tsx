import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormSgSgIcmpRule } from 'localTypes/rules'
import { SgSgIcmpTable } from '../../RulesTables'
import { AddSgSgIcmpPopover } from '../../../atoms'
import { Styled } from '../styled'

type TSgSgIcmpRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgSgIcmpRule[]
  setRules: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
  rulesOtherside: TFormSgSgIcmpRule[]
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgIcmpRule[]>
  centerSg?: string
  isDisabled?: boolean
}

export const SgSgIcmpRules: FC<TSgSgIcmpRulesProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  rules,
  setRules,
  rulesOtherside,
  setRulesOtherside,
  centerSg,
  isDisabled,
}) => {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean[]>([])
  const dispatch = useDispatch()

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: TFormSgSgIcmpRule) => {
    dispatch(
      setRules([
        ...rules,
        {
          ...values,
          formChanges: {
            status: STATUSES.new,
          },
        },
      ]),
    )
    /* remove as legacy after only ie-sg-sg will remain */
    if (values.sg === centerSg) {
      dispatch(
        setRulesOtherside([
          ...rulesOtherside,
          {
            ...values,
            formChanges: {
              status: STATUSES.new,
            },
          },
        ]),
      )
    }
    /* end of remove block */
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  return (
    <>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <SgSgIcmpTable
        isChangesMode={false}
        popoverPosition={popoverPosition}
        rulesAll={rules}
        rulesData={rules}
        setRules={setRules}
        rulesOtherside={rulesOtherside}
        setRulesOtherside={setRulesOtherside}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        centerSg={centerSg}
        isDisabled={isDisabled}
        forceArrowsUpdate={forceArrowsUpdate}
      />
      <Popover
        content={<AddSgSgIcmpPopover hide={toggleAddPopover} addNew={addNew} />}
        title="SG SG ICMP"
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
