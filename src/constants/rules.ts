import { TFormChangesStatuses } from 'localTypes/rules'

export const ITEMS_PER_PAGE = 10
export const ITEMS_PER_PAGE_EDITOR = 5

export const STATUSES: { [k: string]: TFormChangesStatuses } = {
  new: 'new',
  modified: 'modified',
  deleted: 'deleted',
}
