import React, { FC, Dispatch, SetStateAction } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { TransformBlockInner } from './organisms'

type TTransformBlockProps = {
  onSelectCenterSg: (value?: string) => void
  onSetSpecific: Dispatch<SetStateAction<{ open: boolean; value?: string }>>
}

export const TransformBlock: FC<TTransformBlockProps> = ({ onSelectCenterSg, onSetSpecific }) => {
  return (
    <TransformWrapper
      minScale={0.05}
      initialScale={0.3}
      limitToBounds={false}
      doubleClick={{ disabled: true }}
      alignmentAnimation={{ disabled: true }}
      centerOnInit
      wheel={{ excluded: ['no-scroll'] }}
    >
      <TransformComponent wrapperStyle={{ width: '100%', height: '100vh' }}>
        <TransformBlockInner onSelectCenterSg={onSelectCenterSg} onSetSpecific={onSetSpecific} />
      </TransformComponent>
    </TransformWrapper>
  )
}
