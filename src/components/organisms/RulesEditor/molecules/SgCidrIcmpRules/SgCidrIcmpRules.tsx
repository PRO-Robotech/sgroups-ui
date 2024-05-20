import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormSgCidrIcmpRule, TTraffic } from 'localTypes/rules'
import { AddSgCidrIcmpPopover } from '../../atoms'
import { SgCidrIcmpTable } from '../tables'
import { Styled } from '../styled'

type TSgCidrIcmpRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgCidrIcmpRule[]
  setRules: ActionCreatorWithPayload<TFormSgCidrIcmpRule[]>
  defaultTraffic: TTraffic
  isDisabled?: boolean
}

export const SgCidrIcmpRules: FC<TSgCidrIcmpRulesProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  rules,
  setRules,
  defaultTraffic,
  isDisabled,
}) => {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean[]>([])

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: TFormSgCidrIcmpRule) => {
    setRules([
      ...rules,
      {
        ...values,
        traffic: defaultTraffic,
        formChanges: {
          status: STATUSES.new,
        },
      },
    ])
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  return (
    <>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <SgCidrIcmpTable
        isChangesMode={false}
        popoverPosition={popoverPosition}
        defaultTraffic={defaultTraffic}
        rulesAll={rules}
        rulesData={rules}
        setRules={setRules}
        setEditOpen={setEditOpen}
        editOpen={editOpen}
        isDisabled={isDisabled}
        forceArrowsUpdate={forceArrowsUpdate}
      />
      <Popover
        content={<AddSgCidrIcmpPopover hide={toggleAddPopover} addNew={addNew} />}
        title="SG-SG-IE"
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
