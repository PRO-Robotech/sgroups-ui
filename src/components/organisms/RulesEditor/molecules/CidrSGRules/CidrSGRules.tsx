import React, { FC, useState, Dispatch, SetStateAction } from 'react'
import { Button, Popover } from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { PlusOutlined } from '@ant-design/icons'
import { TitleWithNoTopMargin } from 'components/atoms'
import { STATUSES } from 'constants/rules'
import { TFormCidrSgRule, TTraffic } from 'localTypes/rules'
import { CidrSgTable } from '../tables'
import { AddCidrSgPopover } from '../../atoms'
import { Styled } from '../styled'

type TCidrSGRulesProps = {
  forceArrowsUpdate: () => void
  title: string
  popoverPosition: TooltipPlacement
  defaultTraffic: TTraffic
  rules: TFormCidrSgRule[]
  setRules: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  isDisabled?: boolean
}

export const CidrSGRules: FC<TCidrSGRulesProps> = ({
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

  const toggleAddPopover = () => {
    setAddOpen(!addOpen)
  }

  const addNew = (values: TFormCidrSgRule) => {
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
    <Styled.GroupRulesNode>
      <TitleWithNoTopMargin level={4}>{title}</TitleWithNoTopMargin>
      <CidrSgTable
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
        content={<AddCidrSgPopover hide={toggleAddPopover} addNew={addNew} />}
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
    </Styled.GroupRulesNode>
  )
}
