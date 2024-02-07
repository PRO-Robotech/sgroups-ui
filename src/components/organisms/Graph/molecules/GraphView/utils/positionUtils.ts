export const getPositionInCircle = (
  itemIndex: number,
  step: number,
  radius: number,
  elWidth: number,
  elHeight: number,
): { x: number; y: number } => {
  const angle = itemIndex * step
  const x = Math.round(radius * Math.cos(angle) - elWidth / 2)
  const y = Math.round(radius * Math.sin(angle) - elHeight / 2)
  return { x, y }
}
