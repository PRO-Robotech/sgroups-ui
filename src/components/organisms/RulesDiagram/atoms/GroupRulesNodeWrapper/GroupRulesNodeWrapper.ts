import styled from 'styled-components'

type TGroupRulesNodeWrapperProps = {
  $isCenterSg?: boolean
  $isDark?: boolean
  $bgColor?: string
}

export const GroupRulesNodeWrapper = styled.div<TGroupRulesNodeWrapperProps>`
  width: ${({ $isCenterSg }) => ($isCenterSg ? '400px' : '1000px')};
  padding: 14px;
  background: ${({ $bgColor }) => $bgColor || '#fff'};
  border: 1px solid ${({ $isDark }) => ($isDark ? '#3C3C3C' : '#0000000f')};
  border-radius: 8px;
  box-shadow: 0px 1.79px 3.58px 0px #00000005;
  display: flex;
  flex-flow: column;
  box-sizing: border-box;
`
