import { TFormChangesStatuses } from 'localTypes/rules'

export const ITEMS_PER_PAGE = 10
export const ITEMS_PER_PAGE_EDITOR = 5

export const STATUSES: { [k: string]: TFormChangesStatuses } = {
  new: 'new',
  modified: 'modified',
  deleted: 'deleted',
}

export const DEFAULT_PRIORITIES: { [k: string]: string } = {
  sgToSgIcmp: '-300',
  sgToSg: '-200',
  sgToSgIeIcmp: '-100',
  sgToSgIe: '0',
  sgToFqdn: '100',
  sgToCidrIeIcmp: '200',
  sgToCidrIe: '300',
}
