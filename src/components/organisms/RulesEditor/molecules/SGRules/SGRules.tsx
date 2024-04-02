import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormSgRule } from 'localTypes/rules'
import { AddSGPopover } from '../../atoms'
import { SGTable } from '../tables'
import { Styled } from '../styled'

type TSGRulesProps = {
  forceArrowsUpdate: () => void
  sgNames: string[]
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormSgRule[]
  setRules: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesOtherside: TFormSgRule[]
  setRulesOtherside: Dispatch<SetStateAction<TFormSgRule[]>>
  centerSg?: string
  isDisabled?: boolean
}

export const SGRules: FC<TSGRulesProps> = ({
  forceArrowsUpdate,
  sgNames,
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

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: TFormSgRule) => {
    setRules([
      ...rules,
      {
        ...values,
        formChanges: {
          status: STATUSES.new,
        },
      },
    ])
    /* remove as legacy after only ie-sg-sg will remain */
    if (values.sg === centerSg) {
      setRulesOtherside([
        ...rulesOtherside,
        {
          ...values,
          formChanges: {
            status: STATUSES.new,
          },
        },
      ])
    }
    /* end of remove block */
    setEditOpen([...editOpen, false])
    toggleAddPopover()
  }

  return (
    <>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <SGTable
        isChangesMode={false}
        sgNames={sgNames}
        rules={rules}
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
        content={<AddSGPopover sgNames={sgNames} hide={toggleAddPopover} addNew={addNew} />}
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
