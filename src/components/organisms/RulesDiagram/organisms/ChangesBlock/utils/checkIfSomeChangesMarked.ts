export const checkIfSomeChangesMarked = (data: (unknown & { checked?: boolean })[]): boolean => {
  return data.some(({ checked }) => checked === true)
}
