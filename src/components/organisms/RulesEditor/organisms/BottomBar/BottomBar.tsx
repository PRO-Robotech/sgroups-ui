import React, { FC, useState, useEffect, useCallback } from 'react'
import { Button, Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { Spacer } from 'components'
import {
  TFormSgRule,
  TFormFqdnRule,
  TFormCidrSgRule,
  TFormSgSgIcmpRule,
  TFormSgSgIeRule,
  TFormSgSgIeIcmpRule,
} from 'localTypes/rules'
import { BASEPREFIX } from 'constants/basePrefix'
import { ChangesBlock } from '../../molecules'
import { Styled } from './styled'

type TBottomBarProps = {
  onSubmit: () => void
  rulesSgFrom: TFormSgRule[]
  rulesSgTo: TFormSgRule[]
  rulesFqdnTo: TFormFqdnRule[]
  rulesCidrSgFrom: TFormCidrSgRule[]
  rulesCidrSgTo: TFormCidrSgRule[]
  rulesSgSgIcmpFrom: TFormSgSgIcmpRule[]
  rulesSgSgIcmpTo: TFormSgSgIcmpRule[]
  rulesSgSgIeFrom: TFormSgSgIeRule[]
  rulesSgSgIeTo: TFormSgSgIeRule[]
  rulesSgSgIeIcmpFrom: TFormSgSgIeIcmpRule[]
  rulesSgSgIeIcmpTo: TFormSgSgIeIcmpRule[]
  centerSg?: string
}

export const BottomBar: FC<TBottomBarProps> = ({
  centerSg,
  onSubmit,
  rulesSgFrom,
  rulesSgTo,
  rulesFqdnTo,
  rulesCidrSgFrom,
  rulesCidrSgTo,
  rulesSgSgIcmpFrom,
  rulesSgSgIcmpTo,
  rulesSgSgIeFrom,
  rulesSgSgIeTo,
  rulesSgSgIeIcmpFrom,
  rulesSgSgIeIcmpTo,
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
          <Breadcrumb
            items={[
              {
                href: `${BASEPREFIX}/`,
                title: <HomeOutlined />,
              },
              {
                title: 'Editor',
              },
            ]}
          />
        </Styled.FlexContainerItem>
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
          rulesSgFrom={rulesSgFrom}
          rulesSgTo={rulesSgTo}
          rulesFqdnTo={rulesFqdnTo}
          rulesCidrSgTo={rulesCidrSgTo}
          rulesCidrSgFrom={rulesCidrSgFrom}
          rulesSgSgIcmpFrom={rulesSgSgIcmpFrom}
          rulesSgSgIcmpTo={rulesSgSgIcmpTo}
          rulesSgSgIeFrom={rulesSgSgIeFrom}
          rulesSgSgIeTo={rulesSgSgIeTo}
          rulesSgSgIeIcmpFrom={rulesSgSgIeIcmpFrom}
          rulesSgSgIeIcmpTo={rulesSgSgIeIcmpTo}
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
