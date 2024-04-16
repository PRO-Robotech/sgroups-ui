import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components'
import { STATUSES } from 'constants/rules'
import { TFormFqdnRule } from 'localTypes/rules'
import { AddFqdnPopover } from '../../atoms'
import { FQDNTable } from '../tables'
import { Styled } from '../styled'

type TFQDNRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  rules: TFormFqdnRule[]
  setRules: Dispatch<SetStateAction<TFormFqdnRule[]>>
  isDisabled?: boolean
}

export const FQDNRules: FC<TFQDNRulesProps> = ({
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

  const addNew = (values: TFormFqdnRule) => {
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
      <FQDNTable
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
        content={<AddFqdnPopover hide={toggleAddPopover} addNew={addNew} />}
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
