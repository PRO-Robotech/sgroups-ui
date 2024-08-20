import { TooltipPlacement } from 'antd/es/tooltip'
import { TRulesTypes, TRulesSubTypes } from 'localTypes/rules'

type TRULES_CONFIGS = {
  [k: string]: {
    isSg?: boolean
    isFqdn?: boolean
    isCidr?: boolean
    isPorts?: boolean
    isTransport?: boolean
    isIcmp?: boolean
    isTrace?: boolean
  }
}

export const RULES_CONFIGS: TRULES_CONFIGS = {
  sgSg: { isSg: true, isPorts: true, isTransport: true },
  sgSgIcmp: { isSg: true, isIcmp: true, isTrace: true },
  sgSgIe: { isSg: true, isPorts: true, isTransport: true, isTrace: true },
  sgSgIeIcmp: { isSg: true, isIcmp: true, isTrace: true },
  sgFqdn: { isFqdn: true, isPorts: true, isTransport: true },
  sgCidr: { isCidr: true, isPorts: true, isTransport: true, isTrace: true },
  sgCidrIcmp: { isCidr: true, isIcmp: true, isTrace: true },
}

type TRULES_CONFIGS_FOR_FACTORY = {
  [k: string]: {
    [subk: string]: {
      type: TRulesTypes
      subtype: TRulesSubTypes
      title: string
      popoverPosition: TooltipPlacement
    }
  }
}

export const RULES_CONFIGS_FOR_FACTORY: TRULES_CONFIGS_FOR_FACTORY = {
  sgSg: {
    from: { type: 'sgSg', subtype: 'from', title: 'SG From', popoverPosition: 'left' },
    to: { type: 'sgSg', subtype: 'to', title: 'SG To', popoverPosition: 'right' },
  },
  sgSgIcmp: {
    from: { type: 'sgSgIcmp', subtype: 'from', title: 'SG-ICMP From', popoverPosition: 'left' },
    to: { type: 'sgSgIcmp', subtype: 'to', title: 'SG-ICMP To', popoverPosition: 'right' },
  },
  sgSgIe: {
    from: { type: 'sgSgIe', subtype: 'from', title: 'SG-IE From', popoverPosition: 'left' },
    to: { type: 'sgSgIe', subtype: 'to', title: 'SG-IE To', popoverPosition: 'right' },
  },
  sgSgIeIcmp: {
    from: { type: 'sgSgIeIcmp', subtype: 'from', title: 'SG-IE-ICMP From', popoverPosition: 'left' },
    to: { type: 'sgSgIeIcmp', subtype: 'to', title: 'SG-IE-ICMP To', popoverPosition: 'right' },
  },
  sgFqdn: {
    from: { type: 'sgFqdn', subtype: 'from', title: 'FQDN From', popoverPosition: 'left' },
    to: { type: 'sgFqdn', subtype: 'to', title: 'FQDN To', popoverPosition: 'right' },
  },
  sgCidr: {
    from: { type: 'sgCidr', subtype: 'from', title: 'CIDR From', popoverPosition: 'left' },
    to: { type: 'sgCidr', subtype: 'to', title: 'CIDR To', popoverPosition: 'right' },
  },
  sgCidrIcmp: {
    from: { type: 'sgCidrIcmp', subtype: 'from', title: 'CIDR-ICMP From', popoverPosition: 'left' },
    to: { type: 'sgCidrIcmp', subtype: 'to', title: 'CIDR-ICMP To', popoverPosition: 'right' },
  },
}
