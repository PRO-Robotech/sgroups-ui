import { useEffect, useState } from 'react'
import { FOOTER_HEIGHT, HEAD_FIRST_ROW, NAV_HEIGHT } from 'constants/blocksSizes'

const CONTENT_CARD_VERTICAL_PADDING = 48

const getContentCardHeight = () =>
  window.innerHeight - HEAD_FIRST_ROW - NAV_HEIGHT - FOOTER_HEIGHT - CONTENT_CARD_VERTICAL_PADDING

export const useContentCardHeight = () => {
  const [height, setHeight] = useState(() => (typeof window === 'undefined' ? 0 : getContentCardHeight()))

  useEffect(() => {
    const updateHeight = () => {
      setHeight(getContentCardHeight())
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return height
}
