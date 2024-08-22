import React, { FC } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { TransformBlockInner } from './organisms'

type TTransformBlockProps = {
  type: string
  subtype: string
}

/* center on init issue in library */

export const TransformBlock: FC<TTransformBlockProps> = ({ type, subtype }) => {
  const theme = useSelector((state: RootState) => state.theme.theme)

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
        wrapperStyle={{
          maxWidth: 'calc(100vw - 240px)',
          minHeight: 'calc(100vh - 185px)',
          background: theme === 'dark' ? '#222222' : '#f9f9f9b3',
        }}
        contentStyle={{ maxHeight: '100dvh' }}
      >
        <TransformBlockInner type={type} subtype={subtype} />
      </TransformComponent>
    </TransformWrapper>
  )
}
