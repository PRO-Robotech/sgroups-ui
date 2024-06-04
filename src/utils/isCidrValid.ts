import cidrRegex from 'cidr-regex'

export const isCidrValid = (input: string): boolean => {
  return cidrRegex({ exact: true }).test(input) || cidrRegex.v6({ exact: true }).test(input)
}
