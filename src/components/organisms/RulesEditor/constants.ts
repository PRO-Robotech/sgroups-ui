export const RULES_CONFIGS = {
  sgSg: { isSg: true, isPorts: true, isTransport: true },
  sgSgIcmp: { isSg: true, isIcmp: true, isTrace: true },
  sgSgIe: { isSg: true, isPorts: true, isTransport: true, isTrace: true },
  sgSgIeIcmp: { isSg: true, isIcmp: true, isTrace: true },
  sgFqdn: { isFqdn: true, isPorts: true, isTransport: true },
  sgCidr: { isCidr: true, isPorts: true, isTransport: true, isTrace: true },
  sgCidrIcmp: { isCidr: true, isIcmp: true, isTrace: true },
}
