import React, { FC, useState, useEffect } from 'react'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { ChangesBlock } from '../../organisms'
import { isChangesExist } from './utils'
import { Styled } from './styled'

type TBottomBarProps = {
  onSubmit: () => void
}

export const BottomBar: FC<TBottomBarProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitButtonActive, setSubmitButtonActive] = useState(false)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  const rulesSgSgFrom = useSelector((state: RootState) => state.rulesSgSg.rulesFrom)
  const rulesSgSgTo = useSelector((state: RootState) => state.rulesSgSg.rulesTo)
  const rulesSgSgIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesFrom)
  const rulesSgSgIcmpTo = useSelector((state: RootState) => state.rulesSgSgIcmp.rulesTo)
  const rulesSgSgIeFrom = useSelector((state: RootState) => state.rulesSgSgIe.rulesFrom)
  const rulesSgSgIeTo = useSelector((state: RootState) => state.rulesSgSgIe.rulesTo)
  const rulesSgSgIeIcmpFrom = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesFrom)
  const rulesSgSgIeIcmpTo = useSelector((state: RootState) => state.rulesSgSgIeIcmp.rulesTo)
  const rulesSgFqdnTo = useSelector((state: RootState) => state.rulesSgFqdn.rulesTo)
  const rulesSgCidrFrom = useSelector((state: RootState) => state.rulesSgCidr.rulesFrom)
  const rulesSgCidrTo = useSelector((state: RootState) => state.rulesSgCidr.rulesTo)
  const rulesSgCidrIcmpFrom = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesFrom)
  const rulesSgCidrIcmpTo = useSelector((state: RootState) => state.rulesSgCidrIcmp.rulesTo)

  useEffect(() => {
    if (
      isChangesExist([
        ...rulesSgSgFrom,
        ...rulesSgSgTo,
        ...rulesSgSgIcmpFrom,
        ...rulesSgSgIcmpTo,
        ...rulesSgSgIeFrom,
        ...rulesSgSgIeTo,
        ...rulesSgSgIeIcmpFrom,
        ...rulesSgSgIeIcmpTo,
        ...rulesSgFqdnTo,
        ...rulesSgCidrFrom,
        ...rulesSgCidrTo,
        ...rulesSgCidrIcmpFrom,
        ...rulesSgCidrIcmpTo,
      ])
    ) {
      setSubmitButtonActive(true)
    } else {
      setSubmitButtonActive(false)
    }
  }, [
    rulesSgSgFrom,
    rulesSgSgTo,
    rulesSgSgIcmpFrom,
    rulesSgSgIcmpTo,
    rulesSgSgIeFrom,
    rulesSgSgIeTo,
    rulesSgSgIeIcmpFrom,
    rulesSgSgIeIcmpTo,
    rulesSgFqdnTo,
    rulesSgCidrFrom,
    rulesSgCidrTo,
    rulesSgCidrIcmpFrom,
    rulesSgCidrIcmpTo,
  ])

  return (
    <Styled.Container $isOpen={isOpen}>
      <Styled.FlexContainer>
        <Styled.FlexContainerItem>
          {!isOpen && (
            <Button
              type="primary"
              htmlType="submit"
              disabled={!centerSg || !isSubmitButtonActive}
              onClick={() => setIsOpen(true)}
            >
              Submit
            </Button>
          )}
        </Styled.FlexContainerItem>
      </Styled.FlexContainer>
      {centerSg && isOpen && (
        <ChangesBlock
          centerSg={centerSg}
          onClose={() => {
            setIsOpen(false)
          }}
          onSubmit={() => {
            onSubmit()
            setIsOpen(false)
          }}
        />
      )}
    </Styled.Container>
  )
}
