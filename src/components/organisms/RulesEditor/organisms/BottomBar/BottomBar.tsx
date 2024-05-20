import React, { FC, useState, useEffect, useCallback } from 'react'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { Spacer } from 'components'
import { ChangesBlock } from '../../molecules'
import { Styled } from './styled'

type TBottomBarProps = {
  onSubmit: () => void
}

export const BottomBar: FC<TBottomBarProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false)
  const centerSg = useSelector((state: RootState) => state.centerSg.centerSg)

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
