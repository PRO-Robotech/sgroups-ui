import React from 'react'
import { LinkOutlined } from '@ant-design/icons'
import { Link, useInRouterContext } from 'react-router-dom'
import { getPluginBasePath } from './getPluginBasePath'
import { renderBadgeWithValue, renderNamespacedResourceValue } from './tableFormatters'

export type TSgroupsResourcePlural = 'addressgroups' | 'hosts' | 'networks' | 'rules' | 'services'

export const getInternalSgroupsResourceHref = ({
  name,
  namespace,
  plural,
}: {
  name?: string
  namespace?: string
  plural: TSgroupsResourcePlural
}) => {
  if (!namespace || !name) {
    return undefined
  }

  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  const basePath = getPluginBasePath(pathname)

  return `${basePath}/${plural}/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`
}

const SgroupsResourceLink = ({
  href,
  ariaLabel,
  title,
  children,
}: {
  href: string
  ariaLabel?: string
  title?: string
  children?: React.ReactNode
}) => {
  const inRouter = useInRouterContext()

  if (!inRouter) {
    return (
      <a
        aria-label={ariaLabel}
        className="ant-typography ant-typography-link"
        href={href}
        title={title}
        onClick={event => {
          event.stopPropagation()
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      aria-label={ariaLabel}
      className="ant-typography ant-typography-link"
      to={href}
      title={title}
      onClick={event => {
        event.stopPropagation()
      }}
    >
      {children}
    </Link>
  )
}

const renderResourceLink = (href: string | undefined, value?: React.ReactNode) => {
  if (!href) {
    return value
  }

  return <SgroupsResourceLink href={href}>{value}</SgroupsResourceLink>
}

export const renderLinkedTreeResourceTitle = ({
  label,
  name,
  namespace,
  plural,
}: {
  label: React.ReactNode
  name?: string
  namespace?: string
  plural: TSgroupsResourcePlural
}) => {
  const href = getInternalSgroupsResourceHref({ name, namespace, plural })

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
      {label}
      {href && (
        <SgroupsResourceLink ariaLabel={`Open ${namespace}/${name} details`} href={href} title="Open details">
          <LinkOutlined style={{ fontSize: 12 }} />
        </SgroupsResourceLink>
      )}
    </span>
  )
}

export const renderLinkedResourceBadge = ({
  badgeValue,
  displayValue,
  name,
  namespace,
  plural,
}: {
  badgeValue: string
  displayValue?: string
  name?: string
  namespace?: string
  plural: TSgroupsResourcePlural
}) =>
  renderBadgeWithValue(
    badgeValue,
    renderResourceLink(getInternalSgroupsResourceHref({ name, namespace, plural }), displayValue),
  )

export const renderLinkedNamespacedResourceValue = ({
  badgeValue,
  displayValue,
  name,
  namespace,
  plural,
}: {
  badgeValue: string
  displayValue?: string
  name?: string
  namespace?: string
  plural: TSgroupsResourcePlural
}) => {
  if (!namespace) {
    return renderLinkedResourceBadge({ badgeValue, displayValue, name, namespace, plural })
  }

  return renderNamespacedResourceValue(
    badgeValue,
    namespace,
    renderResourceLink(getInternalSgroupsResourceHref({ name, namespace, plural }), displayValue),
  )
}
