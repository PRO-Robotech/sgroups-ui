export const getNumberedPriorty = (priority?: string | number): number | undefined => {
  if (!priority) {
    return undefined
  }
  if (typeof priority === 'string') {
    return priority.length > 0 ? Number(priority) : undefined
  }
  return priority
}
