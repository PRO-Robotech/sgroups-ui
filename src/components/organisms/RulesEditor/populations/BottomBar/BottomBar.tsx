import React, { FC, useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { Button, Segmented } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Spacer } from 'components'
import { ChangesBlock } from '../../organisms'
import { isChangesExist } from './utils'
import { Styled } from './styled'
import { VIEW_TYPE } from '../../constants'

type TBottomBarProps = {
  onSubmit: () => void
  viewType: string
  onViewTypeChange: Dispatch<SetStateAction<string>>
}

export const BottomBar: FC<TBottomBarProps> = ({ onSubmit, viewType, onViewTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitButtonActive, setSubmitButtonActive] = useState(false)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

  const [isResizable, setIsResizable] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number>()

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
        <Styled.FlexContainerItem>
          <Segmented
            options={[
              {
                label: VIEW_TYPE.simple,
                value: VIEW_TYPE.simple,
              },
              {
                label: VIEW_TYPE.overview,
                value: VIEW_TYPE.overview,
              },
            ]}
            defaultValue={viewType}
            onChange={value => {
              if (typeof value === 'string') {
                onViewTypeChange(value)
              }
            }}
          />
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
