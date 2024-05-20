import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormSgSgRule } from 'localTypes/rules'
import { AddSgSgPopover } from '../../atoms'
import { SgSgTable } from '../tables'
import { Styled } from '../styled'

type TSgSgRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgSgRule[]
  setRules: ActionCreatorWithPayload<TFormSgSgRule[]>
  rulesOtherside: TFormSgSgRule[]
  setRulesOtherside: ActionCreatorWithPayload<TFormSgSgRule[]>
  centerSg?: string
  isDisabled?: boolean
}

export const SgSgRules: FC<TSgSgRulesProps> = ({
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

  const addNew = (values: TFormSgSgRule) => {
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
      <SgSgTable
        isChangesMode={false}
        rulesAll={rules}
        rulesData={rules}
        setRules={setRules}
        rulesOtherside={rulesOtherside}
        setRulesOtherside={setRulesOtherside}
        popoverPosition={popoverPosition}
        setEditOpen={setEditOpen}
        editOpen={editOpen}
        centerSg={centerSg}
        isDisabled={isDisabled}
        forceArrowsUpdate={forceArrowsUpdate}
      />
      <Popover
        content={<AddSgSgPopover hide={toggleAddPopover} addNew={addNew} />}
        title="SG"
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
