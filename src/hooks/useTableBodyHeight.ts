import { RefObject, useCallback, useLayoutEffect, useState } from 'react'

const MIN_TABLE_BODY_HEIGHT = 160

export const useTableBodyHeight = (containerRef: RefObject<HTMLElement>) => {
  const [tableBodyHeight, setTableBodyHeight] = useState<number>()

  const updateTableBodyHeight = useCallback(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const tableHead = container.querySelector<HTMLElement>('.ant-table-thead')
    const headerHeight = tableHead?.getBoundingClientRect().height || 0
    const nextHeight = Math.max(
      MIN_TABLE_BODY_HEIGHT,
      Math.floor(container.getBoundingClientRect().height - headerHeight),
    )

    setTableBodyHeight(currentHeight => (currentHeight === nextHeight ? currentHeight : nextHeight))
  }, [containerRef])

  useLayoutEffect(() => {
    updateTableBodyHeight()

    if (typeof window === 'undefined') {
      return undefined
    }

    const frameId = window.requestAnimationFrame(updateTableBodyHeight)
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => updateTableBodyHeight())

    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current)
    }

    window.addEventListener('resize', updateTableBodyHeight)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateTableBodyHeight)
      resizeObserver?.disconnect()
    }
  })

  return tableBodyHeight
}
