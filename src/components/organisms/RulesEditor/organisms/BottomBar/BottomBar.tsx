import React, { FC, Dispatch, SetStateAction, useState, useEffect, useCallback } from 'react'
import { Button } from 'antd'
import { Spacer } from 'components'
import {
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
  TFormCidrSgIcmpRule,
} from 'localTypes/rules'
import { ChangesBlock } from '../../molecules'
import { Styled } from './styled'

type TBottomBarProps = {
  onSubmit: () => void
  sgNames: string[]
  rulesSgFrom: TFormSgRule[]
  setRulesSgFrom: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesSgTo: TFormSgRule[]
  setRulesSgTo: Dispatch<SetStateAction<TFormSgRule[]>>
  rulesFqdnTo: TFormFqdnRule[]
  setRulesFqdnTo: Dispatch<SetStateAction<TFormFqdnRule[]>>
  rulesCidrSgFrom: TFormCidrSgRule[]
  setRulesCidrSgFrom: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesCidrSgTo: TFormCidrSgRule[]
  setRulesCidrSgTo: Dispatch<SetStateAction<TFormCidrSgRule[]>>
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[]
  setRulesSgSgIcmpFrom: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[]
  setRulesSgSgIcmpTo: Dispatch<SetStateAction<TFormSgSgIcmpRule[]>>
  rulesSgSgIeFrom: TFormSgSgIeRule[]
  setRulesSgSgIeFrom: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  rulesSgSgIeTo: TFormSgSgIeRule[]
  setRulesSgSgIeTo: Dispatch<SetStateAction<TFormSgSgIeRule[]>>
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[]
  setRulesSgSgIeIcmpFrom: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[]
  setRulesSgSgIeIcmpTo: Dispatch<SetStateAction<TFormSgSgIeIcmpRule[]>>
  rulesCidrSgIcmpFrom: TFormCidrSgIcmpRule[]
  setRulesCidrSgIcmpFrom: Dispatch<SetStateAction<TFormCidrSgIcmpRule[]>>
  rulesCidrSgIcmpTo: TFormCidrSgIcmpRule[]
  setRulesCidrSgIcmpTo: Dispatch<SetStateAction<TFormCidrSgIcmpRule[]>>
  centerSg?: string
}

export const BottomBar: FC<TBottomBarProps> = ({
  centerSg,
  sgNames,
  onSubmit,
  rulesSgFrom,
  setRulesSgFrom,
  rulesSgTo,
  setRulesSgTo,
  rulesFqdnTo,
  setRulesFqdnTo,
  rulesCidrSgFrom,
  setRulesCidrSgFrom,
  rulesCidrSgTo,
  setRulesCidrSgTo,
  rulesSgSgIcmpFrom,
  setRulesSgSgIcmpFrom,
  rulesSgSgIcmpTo,
  setRulesSgSgIcmpTo,
  rulesSgSgIeFrom,
  setRulesSgSgIeFrom,
  rulesSgSgIeTo,
  setRulesSgSgIeTo,
  rulesSgSgIeIcmpFrom,
  setRulesSgSgIeIcmpFrom,
  rulesSgSgIeIcmpTo,
  setRulesSgSgIeIcmpTo,
  rulesCidrSgIcmpFrom,
  setRulesCidrSgIcmpFrom,
  rulesCidrSgIcmpTo,
  setRulesCidrSgIcmpTo,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const [isResizable, setIsResizable] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number>()

  const handleResize = () => {
    setIsResizable(true)
  }

  const handleMouseUp = () => {
    setIsResizable(false)
  }

  const handleMouseMove = useCallback(
    (event: MouseEventInit) => {
      if (isResizable) {
        if (event.clientY) {
          setContainerHeight(document.documentElement.clientHeight - event.clientY)
        }
      }
    },
    [isResizable],
  )

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizable, handleMouseMove])

  return (
    <Styled.Container $isOpen={isOpen} $containerHeight={containerHeight}>
      {isOpen ? <Spacer $space={15} $samespace /> : <Styled.Resizer onMouseDown={() => handleResize()} />}
      <Styled.FlexContainer>
        <Styled.FlexContainerItem>
          {!isOpen && (
            <Button type="primary" htmlType="submit" disabled={!centerSg} onClick={() => setIsOpen(true)}>
              Submit
            </Button>
          )}
        </Styled.FlexContainerItem>
      </Styled.FlexContainer>
      {centerSg && isOpen && (
        <ChangesBlock
          sgNames={sgNames}
          centerSg={centerSg}
          rulesSgFrom={rulesSgFrom}
          setRulesSgFrom={setRulesSgFrom}
          rulesSgTo={rulesSgTo}
          setRulesSgTo={setRulesSgTo}
          rulesFqdnTo={rulesFqdnTo}
          setRulesFqdnTo={setRulesFqdnTo}
          rulesCidrSgFrom={rulesCidrSgFrom}
          setRulesCidrSgFrom={setRulesCidrSgFrom}
          rulesCidrSgTo={rulesCidrSgTo}
          setRulesCidrSgTo={setRulesCidrSgTo}
          rulesSgSgIcmpFrom={rulesSgSgIcmpFrom}
          setRulesSgSgIcmpFrom={setRulesSgSgIcmpFrom}
          rulesSgSgIcmpTo={rulesSgSgIcmpTo}
          setRulesSgSgIcmpTo={setRulesSgSgIcmpTo}
          rulesSgSgIeFrom={rulesSgSgIeFrom}
          setRulesSgSgIeFrom={setRulesSgSgIeFrom}
          rulesSgSgIeTo={rulesSgSgIeTo}
          setRulesSgSgIeTo={setRulesSgSgIeTo}
          rulesSgSgIeIcmpFrom={rulesSgSgIeIcmpFrom}
          setRulesSgSgIeIcmpFrom={setRulesSgSgIeIcmpFrom}
          rulesSgSgIeIcmpTo={rulesSgSgIeIcmpTo}
          setRulesSgSgIeIcmpTo={setRulesSgSgIeIcmpTo}
          rulesCidrSgIcmpFrom={rulesCidrSgIcmpFrom}
          setRulesCidrSgIcmpFrom={setRulesCidrSgIcmpFrom}
          rulesCidrSgIcmpTo={rulesCidrSgIcmpTo}
          setRulesCidrSgIcmpTo={setRulesCidrSgIcmpTo}
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
