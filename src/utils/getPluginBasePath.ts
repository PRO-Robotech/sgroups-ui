const DETAIL_ROUTE_PLURALS = ['addressgroups', 'hosts', 'networks', 'rules', 'services']

export const getPluginBasePath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)

  if (DETAIL_ROUTE_PLURALS.includes(segments.at(-3) ?? '')) {
    return `/${segments.slice(0, -3).join('/')}`
  }

  if (DETAIL_ROUTE_PLURALS.includes(segments.at(-1) ?? '')) {
    return `/${segments.slice(0, -1).join('/')}`
  }

  return pathname
}
