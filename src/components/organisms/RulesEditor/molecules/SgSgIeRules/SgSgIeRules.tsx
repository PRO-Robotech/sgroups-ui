import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormSgSgIeRule, TTraffic } from 'localTypes/rules'
import { AddSgSgIePopover } from '../../atoms'
import { SgSgIeTable } from '../tables'
import { Styled } from '../styled'

type TSgSgIeRulesProps = {
  forceArrowsUpdate: () => void
  sgNames: string[]
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgSgIeRule[]
  setRules: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  defaultTraffic: TTraffic
  isDisabled?: boolean
}

export const SgSgIeRules: FC<TSgSgIeRulesProps> = ({
  forceArrowsUpdate,
  sgNames,
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

  const addNew = (values: TFormSgSgIeRule) => {
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
      <SgSgIeTable
        isChangesMode={false}
        sgNames={sgNames}
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
        content={<AddSgSgIePopover sgNames={sgNames} hide={toggleAddPopover} addNew={addNew} />}
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
