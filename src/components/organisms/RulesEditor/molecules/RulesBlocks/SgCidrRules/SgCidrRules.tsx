import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormSgCidrRule, TTraffic } from 'localTypes/rules'
import { SgCidrTable } from '../../RulesTables'
import { AddSgCidrPopover } from '../../../atoms'
import { Styled } from '../styled'

type TSgCidrRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rules: TFormSgCidrRule[]
  setRules: ActionCreatorWithPayload<TFormSgCidrRule[]>
  isDisabled?: boolean
}

export const SgCidrRules: FC<TSgCidrRulesProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  defaultTraffic,
  rules,
  setRules,
  isDisabled,
}) => {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean[]>([])
  const dispatch = useDispatch()

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: TFormSgCidrRule) => {
    dispatch(
      setRules([
        ...rules,
        {
          ...values,
          traffic: defaultTraffic,
          formChanges: {
            status: STATUSES.new,
          },
        },
      ]),
    )
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  return (
    <>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <SgCidrTable
        isChangesMode={false}
        rulesAll={rules}
        rulesData={rules}
        setRules={setRules}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        defaultTraffic={defaultTraffic}
        popoverPosition={popoverPosition}
        forceArrowsUpdate={forceArrowsUpdate}
        isDisabled={isDisabled}
      />
      <Popover
        content={<AddSgCidrPopover hide={toggleAddPopover} addNew={addNew} />}
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
