import React, { FC, useState } from 'react'
import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components'
import { STATUSES } from 'constants/rules'
import { TFormSgFqdnRule } from 'localTypes/rules'
import { AddSgFqdnPopover } from '../../atoms'
import { SgFqdnTable } from '../tables'
import { Styled } from '../styled'

type TSgFqdnRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgFqdnRule[]
  setRules: ActionCreatorWithPayload<TFormSgFqdnRule[]>
  isDisabled?: boolean
}

export const SgFqdnRules: FC<TSgFqdnRulesProps> = ({
  forceArrowsUpdate,
  title,
  popoverPosition,
  rules,
  setRules,
  isDisabled,
}) => {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean[]>([])

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: TFormSgFqdnRule) => {
    setRules([
      ...rules,
      {
        ...values,
        formChanges: {
          status: STATUSES.new,
        },
      },
    ])
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  return (
    <Styled.GroupRulesNode>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <SgFqdnTable
        isChangesMode={false}
        rulesAll={rules}
        rulesData={rules}
        setRules={setRules}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        popoverPosition={popoverPosition}
        forceArrowsUpdate={forceArrowsUpdate}
        isDisabled={isDisabled}
      />
      <Popover
        content={<AddSgFqdnPopover hide={toggleAddPopover} addNew={addNew} />}
        title="FQDN"
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
    </Styled.GroupRulesNode>
  )
}
