import React, { FC } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { TransformBlockInner } from './organisms'

type TTransformBlockProps = {
  onSelectCenterSg: (value?: string) => void
}

/* center on init issue in library */

export const TransformBlock: FC<TTransformBlockProps> = ({ onSelectCenterSg }) => {
  return (
    <TransformWrapper
      minScale={0.05}
      initialScale={0.275}
      limitToBounds={false}
      doubleClick={{ disabled: true }}
      alignmentAnimation={{ disabled: true }}
      centerOnInit
      wheel={{ excluded: ['no-scroll'] }}
    >
      <TransformComponent
        wrapperStyle={{ maxWidth: '100vw', maxHeight: '100vh' }}
        contentStyle={{ maxWidth: '100%', maxHeight: '100vh' }}
      >
        <TransformBlockInner onSelectCenterSg={onSelectCenterSg} />
      </TransformComponent>
    </TransformWrapper>
  )
}
