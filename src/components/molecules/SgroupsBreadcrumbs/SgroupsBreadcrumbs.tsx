import React, { FC, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ManageableBreadcrumbs, TManageableBreadcrumbsProps } from '@prorobotech/openapi-k8s-toolkit'
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import { Styled } from './styled'

export type TSgroupsBreadcrumbLink = {
  key: string
  label: string
  link?: string
}

const toBreadcrumbItems = (items: TSgroupsBreadcrumbLink[]): BreadcrumbItemType[] =>
  items.map(({ key, label, link }) => ({
    key,
    title: link ? <Link to={link}>{label}</Link> : label,
  }))

type TSgroupsBreadcrumbsProps = {
  items: TSgroupsBreadcrumbLink[]
}

export const SgroupsBreadcrumbs: FC<TSgroupsBreadcrumbsProps> = ({ items }) => {
  const data = useMemo<TManageableBreadcrumbsProps['data']>(
    () => ({
      breadcrumbItems: toBreadcrumbItems(items),
    }),
    [items],
  )

  return (
    <Styled.Wrapper>
      <ManageableBreadcrumbs data={data} />
    </Styled.Wrapper>
  )
}
