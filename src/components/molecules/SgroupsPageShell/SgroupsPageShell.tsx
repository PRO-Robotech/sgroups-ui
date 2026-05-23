import React, { FC, PropsWithChildren } from 'react'
import { theme } from 'antd'
import { SgroupsBreadcrumbs, TSgroupsBreadcrumbLink } from 'components/molecules/SgroupsBreadcrumbs'
import { Styled } from './styled'

type TSgroupsPageShellProps = PropsWithChildren<{
  breadcrumbItems: TSgroupsBreadcrumbLink[]
}>

export const SgroupsPageShell: FC<TSgroupsPageShellProps> = ({ breadcrumbItems, children }) => {
  const { token } = theme.useToken()
  const isEmbeddedUnderHost =
    typeof window !== 'undefined' && window.location.pathname.split('/').filter(Boolean).includes('plugins')

  return (
    <>
      {isEmbeddedUnderHost ? (
        <Styled.EmbeddedBreadcrumbSlot>
          <SgroupsBreadcrumbs items={breadcrumbItems} />
        </Styled.EmbeddedBreadcrumbSlot>
      ) : (
        <Styled.NavigationContainer $bgColor={token.colorBgLayout}>
          <SgroupsBreadcrumbs items={breadcrumbItems} />
        </Styled.NavigationContainer>
      )}
      <Styled.Content>{children}</Styled.Content>
    </>
  )
}
