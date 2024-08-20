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
    }
  }
}

export const RULES_CONFIGS_FOR_FACTORY: TRULES_CONFIGS_FOR_FACTORY = {
  sgSg: {
    from: { type: 'sgSg', subtype: 'from', title: 'SG From' },
    to: { type: 'sgSg', subtype: 'to', title: 'SG To' },
  },
  sgSgIcmp: {
    from: { type: 'sgSgIcmp', subtype: 'from', title: 'SG-ICMP From' },
    to: { type: 'sgSgIcmp', subtype: 'to', title: 'SG-ICMP To' },
  },
  sgSgIe: {
    from: { type: 'sgSgIe', subtype: 'from', title: 'SG-IE From' },
    to: { type: 'sgSgIe', subtype: 'to', title: 'SG-IE To' },
  },
  sgSgIeIcmp: {
    from: { type: 'sgSgIeIcmp', subtype: 'from', title: 'SG-IE-ICMP From' },
    to: { type: 'sgSgIeIcmp', subtype: 'to', title: 'SG-IE-ICMP To' },
  },
  sgFqdn: {
    from: { type: 'sgFqdn', subtype: 'from', title: 'FQDN From' },
    to: { type: 'sgFqdn', subtype: 'to', title: 'FQDN To' },
  },
  sgCidr: {
    from: { type: 'sgCidr', subtype: 'from', title: 'CIDR From' },
    to: { type: 'sgCidr', subtype: 'to', title: 'CIDR To' },
  },
  sgCidrIcmp: {
    from: { type: 'sgCidrIcmp', subtype: 'from', title: 'CIDR-ICMP From' },
    to: { type: 'sgCidrIcmp', subtype: 'to', title: 'CIDR-ICMP To' },
  },
}
