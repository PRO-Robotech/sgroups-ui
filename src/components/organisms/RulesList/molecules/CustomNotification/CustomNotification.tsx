import React, { FC } from 'react'
import { Button } from 'antd'
import { Styled } from './styled'

type TCustomNotificationProps = {
  changesCount: number
  openChangesBlock: () => void
}

export const CustomNotification: FC<TCustomNotificationProps> = ({ changesCount, openChangesBlock }) => (
  <Styled.Container>
    <Styled.TextContainer>
      You have rule changes <Styled.BlueText>({changesCount})</Styled.BlueText>
    </Styled.TextContainer>
    <Button type="primary" onClick={openChangesBlock}>
      Preview
    </Button>
  </Styled.Container>
)
