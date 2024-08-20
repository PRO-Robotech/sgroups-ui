import React, { FC, ReactNode, useState } from 'react'
import { CaretUp, CaretDown } from '@phosphor-icons/react'
import { TitleWithNoMargins, Spacer } from 'components/atoms'
import { Styled } from './styled'

type TRulesBlockProps = {
  title: string
  count: number
  tableFrom?: ReactNode
  tableTo?: ReactNode
}

export const RulesBlock: FC<TRulesBlockProps> = ({ title, count, tableFrom, tableTo }) => {
  const [isCollapsedOpen, setCollapsedOpen] = useState(true)

  return (
    <>
      <Styled.HeaderAndControls
        onClick={() => {
          setCollapsedOpen(!isCollapsedOpen)
        }}
      >
        <TitleWithNoMargins level={5}>
          {title} <Styled.BlueText>({count})</Styled.BlueText>
        </TitleWithNoMargins>
        <Styled.Carets>{isCollapsedOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}</Styled.Carets>
      </Styled.HeaderAndControls>
      <Spacer $space={8} $samespace />
      {isCollapsedOpen && tableFrom && (
        <Styled.CustomCard>
          <Styled.Header>
            <Styled.LeftPart>
              <TitleWithNoMargins level={5}>Ingress</TitleWithNoMargins>
            </Styled.LeftPart>
          </Styled.Header>
          <Spacer $space={20} $samespace />
          {tableFrom}
        </Styled.CustomCard>
      )}
      {isCollapsedOpen && tableTo && (
        <>
          <Spacer $space={8} $samespace />
          <Styled.CustomCard>
            <Styled.Header>
              <Styled.LeftPart>
                <TitleWithNoMargins level={5}>Egress</TitleWithNoMargins>
              </Styled.LeftPart>
            </Styled.Header>
            <Spacer $space={20} $samespace />
            {tableTo}
          </Styled.CustomCard>
        </>
      )}
    </>
  )
}
