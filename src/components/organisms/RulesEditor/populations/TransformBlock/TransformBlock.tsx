import React, { FC } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { TransformBlockInner } from './organisms'

type TTransformBlockProps = {
  onSelectCenterSg: (value?: string) => void
}

export const TransformBlock: FC<TTransformBlockProps> = ({ onSelectCenterSg }) => {
  return (
    <TransformWrapper
      minScale={0.05}
      initialScale={0.5}
      limitToBounds={false}
      doubleClick={{ disabled: true }}
      alignmentAnimation={{ disabled: true }}
      centerOnInit
      wheel={{ excluded: ['no-scroll'] }}
    >
      <TransformComponent wrapperStyle={{ width: '100%', height: '100vh' }}>
        <TransformBlockInner onSelectCenterSg={onSelectCenterSg} />
      </TransformComponent>
    </TransformWrapper>
  )
}
